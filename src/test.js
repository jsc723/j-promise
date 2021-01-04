const { resolve } = require('path');
var JPromise = require('./Promise');
new JPromise.JPromise((resolve, reject) => {
    setTimeout(() => resolve('aaa'), 100);
}).then((data) => {
    console.log('--1-- ', data);
    return new JPromise.JPromise((resolve) => resolve("bbb"));
}).then((data2) => {
    console.log('--2-- ', data2);
    return new JPromise.JPromise((resolve) => {
        setTimeout(() => resolve('ccc'))
    });
}).then((data3) => {
    console.log('--3-- ', data3);
    return new JPromise.JPromise((resolve, reject) => {
        reject('error!!');
        resolve('ddd');
    })
}).then(data4 => {
    console.log(data4); //no exec
    return 'eee';
})
.catch(err => {
    console.log('catch ' + err);
    return 'fff';
}).then(data => {
    console.log('after catch: ', data);
})