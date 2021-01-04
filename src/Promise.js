export class JPromise {
    constructor(executor) {
        this.state = 'pending'
        this.onResolve = [];
        this.onReject = [];
        let resolve = (d) => this._resolve(d);
        let reject = (e) => this._reject(e);
        executor(resolve, reject);
    }
    _resolve(data) {
        if (this.state !== 'pending') 
            return;
        this.data = data;
        this.state = 'resolved';
        // async
        this.onResolve.forEach(f => f(data));
    }
    _reject(msg) {
        if (this.state !== 'pending')
            return;
        this.msg = msg;
        this.state = 'rejected';
        // async
        this.onReject.forEach(f => f(msg));
    }
    
    then(onResolve, onReject) {
        if (this.state === 'resolved') { // sync 
            this.onResolve.forEach(f => f(this.data));
            if (onResolve) {
                return JPromise._wrapWithResolve(onResolve(this.data))
            } else {
                return JPromise._wrapWithResolve(this.data);
            }
        } else if (this.state === 'rejected') { //sync 
            this.onReject.forEach(f => f(this.msg));
            if (onReject) {
                return onReject(this.msg);
            } else {
                return new Promise((resolve, reject) => {reject(this.msg)});
            }
        } else { //async
            const proxy = new JPromise(() => {});
            proxy.thenOnSuccess = onResolve;
            proxy.thenOnReject = onReject;
            this.onResolve.push((data) => proxy._onParentResolve(data));
            this.onReject.push(data => proxy._onParentReject(data));
            return proxy;
        }
    }
    _onParentResolve(data) {
        if (this.thenOnSuccess) {
            const next = JPromise._wrapWithResolve(this.thenOnSuccess(data));
            next.then((data) => {
                this._resolve(data);
            }, (msg) => {
                this._onParentReject(msg);
            });
        }
    }
    _onParentReject(msg) {
        if (this.thenOnReject) {
            const next = JPromise._wrapWithResolve(this.thenOnReject(msg));
            next.then(data => {
                this._resolve(data);
            }, err => {
                this._reject(err);
            })
        } else {
            this._reject(msg);
        }
    }
    static _wrapWithResolve(v) {
        if (v instanceof JPromise) {
            return v;
        } else {
            return new JPromise((resolve) => {resolve(v)});
        }
    }
    catch(onReject) {
        return this.then(null, onReject);
    }
    static all(promises) {
        const allPromise = new JPromise(() => {});
        allPromise._pendingCount = 0;
        allPromise._resolvedData = [];
        allPromise._reverseMap = new Map();
        let i = 0;
        for (const p of promises) {
            allPromise._reverseMap.set(p, i);
            if (p.state === 'pending') {
                allPromise._pendingCount++;
                p.onResolve.push((data) => {
                    const index = allPromise._reverseMap.get(p);
                    allPromise._pendingCount--;
                    allPromise._resolvedData[index] = data;
                    if (allPromise._pendingCount === 0) {
                        allPromise._resolve(allPromise._resolvedData);
                    }
                });
                p.onReject.push(err => {
                    this.allPromise._onParentReject(err);
                })
            } else if (p.state === 'rejected') {
                allPromise._onParentReject(p.msg);
            } else {
                allPromise._resolvedData[i] = p.data;
            }
            i++;
        }
        if (allPromise._pendingCount === 0) {
            allPromise._resolve(allPromise._resolvedData);
        }
        return allPromise;
    }
    static resolve(v) {
        return JPromise._wrapWithResolve(v);
    }
    static reject(v) {
        return new JPromise((_, reject) => reject(v));
    }
}