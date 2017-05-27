const when = require('when')
let response
const rest = jest.fn((url)=>{
  return when({
    entity: response
  })
});

rest.__return = function(resp){
  response = resp
};
export default rest
