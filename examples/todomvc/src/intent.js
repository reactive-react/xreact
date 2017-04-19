import Type from 'union-type'

export default Type({
  Add: [Object],
  Delete: [Number],
  Edit: [Object, Number],
  Editing: [Number],
  Clear: [],
  Filter: [Function],
  Done: [Number],
  Complete: [Number],
  Search: [String],
})
