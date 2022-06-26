


const axios = require('axios');
fs = require('fs');

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    }

async function helper()
{
    var cnt=0;
    var json_final = await axios.get('https://api.covidbedsindia.in/v1/storages/608982f703eef3de2bd05a72/Bengaluru');
   // console.log(json_final)
    for(var i in json_final.data)
    {
        console.log(json_final.data[i].HOSPITAL_NAME)
    }
    
}

helper();