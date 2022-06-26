require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');
var similarity = require( 'compute-cosine-similarity' );
const { lib } = require('./csv.js')
console.log('loading')
//console.log(lib)
const xx =use.load()

function helper(x,model)
{
  return new Promise((resolve, reject) => {
      var res=0;
      var intent;
      const sentences = [x];
      console.log('loaded')
      model.embed(sentences).then(embeddings => {
        console.log('finshed');
        embeddings.print(true);
        var emb = (embeddings.arraySync());
        console.log(emb[0].length)
        for (let item of lib) {
          //console.log(item);
          var t = Object.keys(item);
         // console.log(t)
         
          //console.log(typeof(item[t]));
          var s = similarity( item[t], emb[0] );
          if(res < s)
          {
            res = s;
            intent = t[0]
          }
        }
        //console.log(res);
        //console.log(intent);
        if(res>0.70)
        {
          resolve(intent)
        }
        else
        {
          resolve('default')
        }
        
        //console.log(x)
      })

    });

  }


function determine(str)
{
  return new Promise((resolve, reject) => {
    xx.then(res=>{
    console.log(typeof(res));
    helper(str,res).then(res => {
      resolve(res);
    })
  })
})
}


//determine('hi')
//helper('hi')

module.exports = { determine };