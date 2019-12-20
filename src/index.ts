enum STATE {
  PENDING = 'PENDING',
  FULLFILLED = 'FULLFILLED',
  REJECTED = 'REJECTED'
}

interface ThenCallback<T> {
  onfullfilled: (value?: T) => any;
  onrejected: (reason?: any) => any;
}

export class MyPromise<T> {
  private _state: STATE = STATE.PENDING;
  private chain: ThenCallback<T>[] = [];
  private value: T;

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

  resolve(value?: T): MyPromise<T> {
    if (this._state !== STATE.PENDING) {
      return;
    }

    this._state = STATE.FULLFILLED;
    this.value = value;
    this.chain.forEach(({ onfullfilled }) => {
      setImmediate(() => {
        onfullfilled(value);
      });
    });
  }

  reject(reason?: any): MyPromise<T> {
    if (this._state !== STATE.PENDING) {
      return;
    }

    this._state = STATE.REJECTED;
    this.chain.forEach(({ onrejected }) => {
      setImmediate(reason => onrejected(reason));
    });
  }

  then<TResult1 = T, TResult2 = never>(
    onfullfilled?: (value: T) => TResult1,
    onrejected?: (reason: any) => TResult2
  ): any {
    const { _state, value } = this;
    if (_state === STATE.FULLFILLED) {
      setImmediate(() => this.resolve(value));
      return;
    }

    if (_state === STATE.REJECTED) {
      setImmediate(() => this.reject());
      return;
    }

    this.chain.push({ onfullfilled, onrejected });
    return this;
  }

  get state() {
    return this._state;
  }
}
