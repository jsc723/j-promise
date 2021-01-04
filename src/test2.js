new Promise((resolve, reject) => {
    reject('err');
}).then((data) => {
    console.log(data);
    return 'aaa';
}, (err) => {
    console.log(err);
    throw err;
}).then(data => {
    console.log('3: ', data);
}).catch((err) => {
    console.log('catch ', err);
}).then((data) => {
    console.log('after catch')
})