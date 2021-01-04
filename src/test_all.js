const { resolve } = require('path');
var JPromise = require('./Promise');
JPromise.JPromise.all([
    new JPromise.JPromise((resolve, reject) => {
        setTimeout(() => resolve('aaa'), 100);
    }),
    new JPromise.JPromise((resolve, reject) => {
        setTimeout(() => resolve('bbb'), 200);
    }),
    new JPromise.JPromise.resolve('ccc'),
    new JPromise.JPromise.reject('err')
]).then(data => {
    console.log(data);
}).catch(err => {
    console.error(err);
})