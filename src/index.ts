enum STATE {
  PENDING = 'PENDING',
  FULLFILLED = 'FULLFILLED',
  REJECTED = 'REJECTED'
}

export class MyPromise<T> {
  private _state: STATE = STATE.PENDING;
  private value: any;

  constructor(
    executor: (
      resolve: (value?: T) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    try {
      executor(
        value => this.resolve(value),
        err => this.reject(err)
      );
    } catch (err) {
      this.reject(err);
    }
  }

  resolve<T>(value?: T): MyPromise<T> {
    if (this._state !== STATE.PENDING) {
      return;
    }

    this._state = STATE.FULLFILLED;
    this.value = value;

    return null;
  }

  reject<T>(reason?: any): MyPromise<T> {
    if (this._state !== STATE.PENDING) {
      return;
    }

    this._state = STATE.REJECTED;
    return null;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: (value: T) => TResult1,
    onrejected?: (reason: any) => TResult2
  ): any {
    const { _state, value } = this;
    if (_state === STATE.FULLFILLED) {
      onfulfilled(value);
    } else if (_state === STATE.REJECTED) {
      onrejected(value);
    }
  }

  get state() {
    return this._state;
  }
}
