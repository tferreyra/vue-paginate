import LimitedLinksGenerator from '../util/LimitedLinksGenerator'
import { LEFT_ARROW, RIGHT_ARROW, ELLIPSES, FIRST, LAST } from '../config/linkTypes'
import { warn } from '../util/debug'

export default {
  name: 'paginate-links',
  props: {
    for: {
      type: String,
      required: true
    },
    limit: {
      type: Number,
      default: 0
    },
    simple: {
      type: Object,
      default: null,
      validator (obj) {
        return obj.prev && obj.next && obj.first && obj.last
      }
    },
    stepLinks: {
      type: Object,
      default: () => {
        return {
          prev: LEFT_ARROW,
          next: RIGHT_ARROW,
          first: FIRST,
          last: LAST
        }
      },
      validator (obj) {
        return obj.prev && obj.next && obj.first && obj.last
      }
    },
    showStepLinks: {
      type: Boolean
    },
    hideSinglePage: {
      type: Boolean
    },
    classes: {
      type: Object,
      default: null
    },
    async: {
      type: Boolean,
      default: false
    },
    container: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      listOfPages: [],
      numberOfPages: 0,
      target: null,
      // users: [ ... ],
      paginate: ['pagedUsers'],
      paginationPer: 100,
      paginationCurrentPage: 0
    }
  },
  computed: {
    parent () {
      return this.container ? this.container.el : this.$parent
    },
    state () {
      return this.container ? this.container.state : this.$parent.paginate[this.for]
    },
    currentPage: {
      get () {
        if (this.state) {
          return this.state.page
        }
      },
      set (page) {
        this.state.page = page
      }
    },
    paginationFirstIndex () {
      return this.paginationCurrentPage * this.paginationPer
    },
    paginationLastIndex () {
      const nextIndex = Math.min((this.paginationCurrentPage * this.paginationPer) + this.paginationPer, this.users.length)
      return Math.abs(nextIndex, 0)
    }
  },
  mounted () {
    if (this.simple && this.limit) {
      warn(`<paginate-links for="${this.for}"> 'simple' and 'limit' props can't be used at the same time. In this case, 'simple' will take precedence, and 'limit' will be ignored.`, this.parent, 'warn')
    }
    if (this.simple && !this.simple.next) {
      warn(`<paginate-links for="${this.for}"> 'simple' prop doesn't contain 'next' value.`, this.parent)
    }
    if (this.simple && !this.simple.prev) {
      warn(`<paginate-links for="${this.for}"> 'simple' prop doesn't contain 'prev' value.`, this.parent)
    }
    if (this.simple && !this.simple.first) {
      warn(`<paginate-links for="${this.for}"> 'simple' prop doesn't contain 'first' value.`, this.parent)
    }
    if (this.simple && !this.simple.last) {
      warn(`<paginate-links for="${this.for}"> 'simple' prop doesn't contain 'last' value.`, this.parent)
    }
    if (this.stepLinks && !this.stepLinks.next) {
      warn(`<paginate-links for="${this.for}"> 'step-links' prop doesn't contain 'next' value.`, this.parent)
    }
    if (this.stepLinks && !this.stepLinks.prev) {
      warn(`<paginate-links for="${this.for}"> 'step-links' prop doesn't contain 'prev' value.`, this.parent)
    }
    if (this.stepLinks && !this.stepLinks.first) {
      warn(`<paginate-links for="${this.for}"> 'step-links' prop doesn't contain 'first' value.`, this.parent)
    }
    if (this.stepLinks && !this.stepLinks.last) {
      warn(`<paginate-links for="${this.for}"> 'step-links' prop doesn't contain 'last' value.`, this.parent)
    }
    this.$nextTick(() => {
      this.updateListOfPages()
    })
  },
  watch: {
    'state': {
      handler () {
        this.updateListOfPages()
      },
      deep: true
    },
    currentPage (toPage, fromPage) {
      this.$emit('change', toPage + 1, fromPage + 1, toFirst, toLast)
    }
  },
  methods: {
    onPagedUsersChange (toPage, lastPage) {
      this.paginationCurrentPage = toPage
    },
    updateListOfPages () {
      this.target = getTargetPaginateComponent(this.parent.$children, this.for)
      if (!this.target) {
        if (this.async) return
        warn(`<paginate-links for="${this.for}"> can't be used without its companion <paginate name="${this.for}">`, this.parent)
        warn(`To fix that issue you may need to use :async="true" on <paginate-links> component to allow for asyncronous rendering`, this.parent, 'warn')
        return
      }
      this.numberOfPages = Math.ceil(this.target.list.length / this.target.per)
      this.listOfPages = getListOfPageNumbers(this.numberOfPages)
    }
  },
  render (h) {
    if (!this.target && this.async) return null

    let links = this.simple
      ? getSimpleLinks(this, h)
      : this.limit > 1
      ? getLimitedLinks(this, h)
      : getFullLinks(this, h)

    if (this.hideSinglePage && this.numberOfPages <= 1) {
      return null
    }

    const el = h('ul', {
      class: ['paginate-links', this.for]
    }, links)

    if (this.classes) {
      this.$nextTick(() => {
        addAdditionalClasses(el.elm, this.classes)
      })
    }
    return el
  }
}

function getFullLinks (vm, h) {
  const allLinks = vm.showStepLinks
    ? [vm.stepLinks.first, vm.stepLinks.prev, ...vm.listOfPages, vm.stepLinks.next, vm.stepLinks.last]
    : vm.listOfPages
  return allLinks.map(link => {
    const data = {
      on: {
        click: (e) => {
          e.preventDefault()
          vm.currentPage = getTargetPageForLink(
            link,
            vm.limit,
            vm.currentPage,
            vm.listOfPages,
            vm.stepLinks
          )
        }
      }
    }
    const liClasses = getClassesForLink(
      link,
      vm.currentPage,
      vm.listOfPages.length - 1,
      vm.stepLinks
    )
    const linkText = link === vm.stepLinks.next || link === vm.stepLinks.prev || link === vm.stepLinks.first || link === vm.stepLinks.last
      ? link
      : link + 1 // it means it's a number
    return h('li', { class: liClasses }, [h('a', data, linkText)])
  })
}

function getLimitedLinks (vm, h) {
  let limitedLinks = new LimitedLinksGenerator(
    vm.listOfPages,
    vm.currentPage,
    vm.limit,
    vm.stepLinks
  ).generate()

  limitedLinks = vm.showStepLinks
    ? [vm.stepLinks.first, vm.stepLinks.prev, ...limitedLinks, vm.stepLinks.next, vm.stepLinks.last]
    : limitedLinks

  const limitedLinksMetadata = getLimitedLinksMetadata(limitedLinks)

  return limitedLinks.map((link, index) => {
    const data = {
      on: {
        click: (e) => {
          e.preventDefault()
          vm.currentPage = getTargetPageForLink(
            link,
            vm.limit,
            vm.currentPage,
            vm.listOfPages,
            vm.stepLinks,
            limitedLinksMetadata[index]
          )
        }
      }
    }
    const liClasses = getClassesForLink(
      link,
      vm.currentPage,
      vm.listOfPages.length - 1,
      vm.stepLinks
    )
    // If the link is a number,
    // then incremented by 1 (since it's 0 based).
    // otherwise, do nothing (so, it's a symbol).
    const text = (link === parseInt(link, 10)) ? link + 1 : link
    return h('li', { class: liClasses }, [h('a', data, text)])
  })
}

function getSimpleLinks (vm, h) {
  const lastPage = vm.listOfPages.length - 1
  const prevData = {
    on: {
      click: (e) => {
        e.preventDefault()
        if (vm.currentPage > 0) vm.currentPage -= 1
      }
    }
  }
  const nextData = {
    on: {
      click: (e) => {
        e.preventDefault()
        if (vm.currentPage < lastPage) vm.currentPage += 1
      }
    }
  }
  const firstData = {
    on: {
      click: (e) => {
        e.preventDefault()
        0
      }
    }
  }
  const lastData = {
    on: {
      click: (e) => {
        e.preventDefault()
        lastPage
      }
    }
  }
  const nextListData = { class: ['next', vm.currentPage >= lastPage ? 'disabled' : ''] }
  const prevListData = { class: ['prev', vm.currentPage <= 0 ? 'disabled' : ''] }
  const firstListData = { class: ['first', vm.currentPage == 0 ? 'disabled' : ''] }
  const lastListData = { class: ['last', vm.currentPage == lastPage ? 'disabled' : ''] }
  const prevLink = h('li', prevListData, [h('a', prevData, vm.simple.prev)])
  const nextLink = h('li', nextListData, [h('a', nextData, vm.simple.next)])
  const firstLink = h('li', firstListData, [h('a', firstData, vm.simple.first)])
  const lastLink = h('li', lastListData, [h('a', lasttData, vm.simple.last)])
  return [prevLink, nextLink, firstLink, lastLink]
}

function getTargetPaginateComponent (children, targetName) {
  return children
    .filter(child => (child.$vnode.componentOptions.tag === 'paginate'))
    .find(child => child.name === targetName)
}

function getListOfPageNumbers (numberOfPages) {
  // converts number of pages into an array
  // that contains each individual page number
  // For Example: 4 => [0, 1, 2, 3]
  return Array.apply(null, { length: numberOfPages })
    .map((val, index) => index)
}

function getClassesForLink(link, currentPage, lastPage, { prev, next, first, last }) {
  let liClass = []
  if (link === prev) {
    liClass.push('left-arrow')
  } else if (link === next) {
    liClass.push('right-arrow')
  } else if (link === ELLIPSES) {
    liClass.push('ellipses')
  } else if (link === FIRST) {
    liClass.push(first) 
  } else if (link === LAST) {
    liClass.push(last)
  } else {
    liClass.push('number')
  }

  if (link === currentPage) {
    liClass.push('active')
  }

  if (link === prev && currentPage <= 0) {
    liClass.push('disabled')
  } else if (link === next && currentPage >= lastPage) {
    liClass.push('disabled')
  } else if (link === first && currentPage == 0) {
    liClass.push('disabled')
  } else if (link === last && currentPage == lastPage) {
    liClass.push('disabled')
  }
  return liClass
}

function getTargetPageForLink (link, limit, currentPage, listOfPages, { prev, next, first, last }, metaData = null) {
  let currentChunk = Math.floor(currentPage / limit)
  if (link === prev) {
    return (currentPage - 1) < 0 ? 0 : currentPage - 1
  } else if (link === next) {
    return (currentPage + 1 > listOfPages.length - 1)
      ? listOfPages.length - 1
      : currentPage + 1
  } else if (link === first) {
    return 0 
  } else if (link === last) {
    return listOfPages.length - 1 
  } else if (metaData && metaData === 'right-ellipses') {
    return (currentChunk + 1) * limit
  } else if (metaData && metaData === 'left-ellipses') {
    const chunkContent = listOfPages.slice(currentChunk * limit, currentChunk * limit + limit)
    const isLastPage = currentPage === listOfPages.length - 1
    if (isLastPage && chunkContent.length === 1) {
      currentChunk--
    }
    return (currentChunk - 1) * limit + limit - 1
  }
  // which is number
  return link
}

/**
 * Mainly used here to check whether the displayed
 * ellipses is for showing previous or next links
 */
function getLimitedLinksMetadata (limitedLinks) {
  return limitedLinks.map((link, index) => {
    if (link === ELLIPSES && limitedLinks[index - 1] === 0) {
      return 'left-ellipses'
    } else if (link === ELLIPSES && limitedLinks[index - 1] !== 0) {
      return 'right-ellipses'
    }
    return link
  })
}

function addAdditionalClasses (linksContainer, classes) {
  Object.keys(classes).forEach(selector => {
    if (selector === 'ul') {
      const selectorValue = classes['ul']
      if (Array.isArray(selectorValue)) {
        selectorValue.forEach(c => linksContainer.classList.add(c))
      } else {
        linksContainer.classList.add(selectorValue)
      }
    }
    linksContainer.querySelectorAll(selector).forEach(node => {
      const selectorValue = classes[selector]
      if (Array.isArray(selectorValue)) {
        selectorValue.forEach(c => node.classList.add(c))
      } else {
        node.classList.add(selectorValue)
      }
    })
  })
}
