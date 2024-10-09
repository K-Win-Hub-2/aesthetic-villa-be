// written by Oakar Kyaw
// high order function

exports.loopThroughItems = (items, fn) => {
   for(let i = 0 ; i < items.length ; i++){
     fn(items[i])
   }
}