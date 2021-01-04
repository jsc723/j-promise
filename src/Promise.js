export class JPromise {
    constructor(executor) {
        this.state = 'pending'
        this.onResolve = [];
        this.onReject = [];
        let resolve = (data) => {
            if (this.state !== 'pending') 
                return;
            this.data = data;
            this.state = 'resolved';
            // async
            this.onResolve.forEach(f => f(data));
        };
        let reject = (msg) => {
            if (this.state !== 'pending')
                return;
            this.msg = msg;
            this.state = 'rejected';
            // async
            this.onReject.forEach(f => f(msg));
        };
        executor(resolve, reject);
        this.resolve = resolve;
        this.reject = reject;
    }
    
    then(onResolve, onReject) {
        if (this.state === 'resolved') { // sync 
            this.onResolve.forEach(f => f(this.data));
            if (onResolve) {
                return this._wrapWithResolve(onResolve(this.data))
            } else {
                return this._wrapWithResolve(this.data);
            }
        } else if (this.state === 'rejected') { //sync 
            this.onReject.forEach(f => f(this.msg));
            if (onReject) {
                return onReject(this.msg);
            } else {
                return new Promise((resolve, reject) => {reject(msg)});
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
            const next = this._wrapWithResolve(this.thenOnSuccess(data));
            next.then((data) => {
                this.resolve(data);
            }, (msg) => {
                this._onParentReject(msg);
            });
        }
    }
    _onParentReject(msg) {
        if (this.thenOnReject) {
            const next = this._wrapWithResolve(this.thenOnReject(msg));
            next.then(data => {
                this.resolve(data);
            }, err => {
                this.reject(err);
            })
        } else {
            this.reject(msg);
        }
    }
    _wrapWithResolve(v) {
        if (v instanceof JPromise) {
            return v;
        } else {
            return new Promise((resolve) => {resolve(v)});
        }
    }
    _wrapWithReject(v) {
        if (v instanceof JPromise) {
            return v;
        } else {
            return new Promise((resolve, reject) => {reject(v)});
        }
    }
    catch(onReject) {
        return this.then(null, onReject);
    }
}