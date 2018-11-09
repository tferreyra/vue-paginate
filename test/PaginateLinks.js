import Vue from 'vue/dist/vue'
import PaginateLinks from '../src/components/PaginateLinks'
import Paginate from '../src/components/Paginate'

const LANGS = [
  'JavaScript', 'PHP',
  'HTML', 'CSS',
  'Ruby', 'Python',
  'Erlang', 'Go'
]

describe('PaginateLinks.vue', () => {
  let vm

  describe('full links', () => {

    it('renders a full list of links', (done) => {
      vm = new Vue({
        template: `
          <div>
            <paginate
              name="langs"
              :list="langs"
              :per="2"
            ></paginate>
            <paginate-links for="langs"></paginate-links>
          </div>`,
        data: {
          langs: LANGS,
          paginate: {langs: { list: [], page: 0 }}
        },
        components: { Paginate, PaginateLinks }
      }).$mount()

      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="number active"><a>1</a></li>',
          '<li class="number"><a>2</a></li>',
          '<li class="number"><a>3</a></li>',
          '<li class="number"><a>4</a></li>'
        ].join(''))
        done()
      })
    })

    it('can show step links for full links', (done) => {
      vm = new Vue({
        template: `
          <div>
            <paginate
              name="langs"
              :list="langs"
              :per="2"
            ></paginate>
            <paginate-links for="langs"
              :show-step-links="true"
              :step-links="{
                first: 'F',
                prev: 'P',
                next: 'N',
                last: 'L'
              }"
            ></paginate-links>
          </div>`,
        data: {
          langs: LANGS,
          paginate: {langs: { list: [], page: 0 }}
        },
        components: { Paginate, PaginateLinks }
      }).$mount()

      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="first-arrow disabled"><a>F</a></li>',
          '<li class="left-arrow disabled"><a>P</a></li>',
          '<li class="number active"><a>1</a></li>',
          '<li class="number"><a>2</a></li>',
          '<li class="number"><a>3</a></li>',
          '<li class="number"><a>4</a></li>',
          '<li class="right-arrow"><a>N</a></li>',
          '<li class="last-arrow"><a>L</a></li>'
        ].join(''))
        done()
      })
    })
  })

  describe('simple links', () => {
    beforeEach(() => {
      vm = new Vue({
        template: `
          <div>
            <paginate
              name="langs"
              :list="langs"
              :per="2"
            ></paginate>
            <paginate-links
              for="langs"
              :simple="{
                first: 'First',
                prev: 'Previous',
                next: 'Next',
                last: 'Last'
              }">
            </paginate-links>
          </div>`,
        data: {
          langs: LANGS,
          paginate: {langs: { list: [], page: 0 }}
        },
        components: { Paginate, PaginateLinks }
      }).$mount()
    })
    
    it('adds `disabled` class to previous link on first page', (done) => {
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="first disabled"><a>First</a></li>',
          '<li class="prev disabled"><a>Previous</a></li>',
          '<li class="next"><a>Next</a></li>',
          '<li class="last"><a>Last</a></li>'
        ].join(''))
        done()
      })
    })
    
    it('doesn\'t add `disabled` class when we are not in first or final page', (done) => {
      vm.paginate.langs.page++
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="first"><a>First</a></li>',
          '<li class="prev"><a>Previous</a></li>',
          '<li class="next"><a>Next</a></li>',
          '<li class="last"><a>Last</a></li>'
        ].join(''))
        done()
      })
    })

    it('adds `disabled` class to next link on final page', (done) => {
      vm.paginate.langs.page = 3
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="first"><a>First</a></li>',
          '<li class="prev"><a>Previous</a></li>',
          '<li class="next disabled"><a>Next</a></li>',
          '<li class="last disabled"><a>Last</a></li>'
        ].join(''))
        done()
      })
    })
  })

  describe('limited links', () => {
    beforeEach(() => {
      vm = new Vue({
        template:
          `<div>
            <paginate name="langs" :list="langs" :per="1"></paginate>
            <paginate-links for="langs" :limit="2"></paginate-links>
          </div>`,
        data: {
          langs: LANGS,
          paginate: {langs: { list: [], page: 0 }}
        },
        components: { Paginate, PaginateLinks }
      }).$mount()
    })

    it('shows correct links with classes', (done) => {
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="number active"><a>1</a></li>',
          '<li class="number"><a>2</a></li>',
          '<li class="ellipses"><a>...</a></li>',
          '<li class="number"><a>8</a></li>',
        ].join(''))
        done()
      })
    })

    it('keeps displayed links the same if the targeted page is within current limited scope', (done) => {
      vm.paginate.langs.page++
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="number"><a>1</a></li>',
          '<li class="number active"><a>2</a></li>',
          '<li class="ellipses"><a>...</a></li>',
          '<li class="number"><a>8</a></li>'
        ].join(''))
        done()
      })
    })

    it('changes the displayed links when the targeted page is out of current limited scope', (done) => {
      vm.paginate.langs.page = 3
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="number"><a>1</a></li>',
          '<li class="ellipses"><a>...</a></li>',
          '<li class="number"><a>3</a></li>',
          '<li class="number active"><a>4</a></li>',
          '<li class="ellipses"><a>...</a></li>',
          '<li class="number"><a>8</a></li>'
        ].join(''))
        done()
      })
    })

    it('displays links properly when changing to the last page', (done) => {
      vm.paginate.langs.page = 7
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
          '<li class="number"><a>1</a></li>',
          '<li class="ellipses"><a>...</a></li>',
          '<li class="number"><a>7</a></li>',
          '<li class="number active"><a>8</a></li>'
        ].join(''))
        done()
      })
    })

    describe('step links for limited links', (done) => {
      beforeEach(() => {
        vm = new Vue({
          template:
            `<div>
              <paginate name="langs" :list="langs" :per="1"></paginate>
              <paginate-links for="langs"
                :show-step-links="true"
                :limit="2"
              ></paginate-links>
            </div>`,
          data: {
            langs: LANGS,
            paginate: {langs: { list: [], page: 0 }}
          },
          components: { Paginate, PaginateLinks }
        }).$mount()
      })

      it('can show step links for limited links', (done) => {
        Vue.nextTick(() => {
          expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
            '<li class="first-arrow disabled"><a>&lt;|</a></li>',
            '<li class="left-arrow disabled"><a>&lt;</a></li>',
            '<li class="number active"><a>1</a></li>',
            '<li class="number"><a>2</a></li>',
            '<li class="ellipses"><a>...</a></li>',
            '<li class="number"><a>8</a></li>',
            '<li class="right-arrow"><a>&gt;</a></li>',
            '<li class="last-arrow"><a>&gt;|</a></li>'
          ].join(''))
          done()
        })
      })

      it('removes disabled class from left arrow if not on first page', (done) => {
        vm.paginate.langs.page++
        Vue.nextTick(() => {
          expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
            '<li class="first-arrow"><a>&lt;|</a></li>',
            '<li class="left-arrow"><a>&lt;</a></li>',
            '<li class="number"><a>1</a></li>',
            '<li class="number active"><a>2</a></li>',
            '<li class="ellipses"><a>...</a></li>',
            '<li class="number"><a>8</a></li>',
            '<li class="right-arrow"><a>&gt;</a></li>',
            '<li class="last-arrow"><a>&gt;|</a></li>',
          ].join(''))
          done()
        })
      })

      it('makes right arrow disabled if it is on last page', (done) => {
        vm.paginate.langs.page = 7
        Vue.nextTick(() => {
          expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
            '<li class="first-arrow"><a>&lt;|</a></li>',
            '<li class="left-arrow"><a>&lt;</a></li>',
            '<li class="number"><a>1</a></li>',
            '<li class="ellipses"><a>...</a></li>',
            '<li class="number"><a>7</a></li>',
            '<li class="number active"><a>8</a></li>',
            '<li class="right-arrow disabled"><a>&gt;</a></li>',
            '<li class="last-arrow disabled"><a>&gt;|</a></li>'
          ].join(''))
          done()
        })
      })

      it('customizes the step links', (done) => {
        vm = new Vue({
          template:
            `<div>
              <paginate name="langs" :list="langs" :per="1"></paginate>
              <paginate-links for="langs"
                :limit="2"
                :show-step-links="true"
                :step-links="{
                  first: 'F',
                  next: 'N',
                  prev: 'P',
                  last: 'L'
                }"
              ></paginate-links>
            </div>`,
          data: {
            langs: LANGS,
            paginate: {langs: { list: [], page: 0 }}
          },
          components: { Paginate, PaginateLinks }
        }).$mount()

        Vue.nextTick(() => {
          expect(vm.$el.querySelector('.paginate-links').innerHTML).to.equal([
            '<li class="first-arrow disabled"><a>F</a></li>',
            '<li class="left-arrow disabled"><a>P</a></li>',
            '<li class="number active"><a>1</a></li>',
            '<li class="number"><a>2</a></li>',
            '<li class="ellipses"><a>...</a></li>',
            '<li class="number"><a>8</a></li>',
            '<li class="right-arrow"><a>N</a></li>',
            '<li class="last-arrow"><a>L</a></li>',
          ].join(''))
          done()
        })
      })

    })
  })

  describe('all types', () => {
    it('can be hidden if it contains a single page', (done) => {
      vm = new Vue({
        template:
          `<div>
            <paginate name="langs" :list="langs" :per="8"></paginate>
            <paginate-links for="langs" :hide-single-page="true"></paginate-links>
          </div>`,
        data: {
          langs: LANGS,
          paginate: {langs: { list: [], page: 0 }}
        },
        components: { Paginate, PaginateLinks }
      }).$mount()

      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links')).to.be.null
        done()
      })
    })

    it('should not be hidden if it contains a single page and hide-single-page=false', (done) => {
      vm = new Vue({
        template:
          `<div>
            <paginate name="langs" :list="langs" :per="8"></paginate>
            <paginate-links for="langs" :hide-single-page="false"></paginate-links>
          </div>`,
        data: {
          langs: LANGS,
          paginate: {langs: { list: [], page: 0 }}
        },
        components: { Paginate, PaginateLinks }
      }).$mount()

      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.paginate-links')).to.be.not.null
        done()
      })
    })
  })

})
