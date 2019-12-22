function isFunction(fn: unknown): fn is Function {
  return typeof fn === 'function';
}

function isThenable<T>(obj: any): obj is PromiseLike<T> {
  return obj && obj.then && isFunction(obj.then);
}
enum STATE {
  PENDING = 'PENDING',
  FULLFILLED = 'FULLFILLED',
  REJECTED = 'REJECTED'
}

interface ThenCallback<T> {
  onfullfilled: (value?: T) => any;
  onrejected: (reason?: any) => any;
}

interface PromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onfullfilled?: (
      value: T
    ) => TResult1 | PromiseLike<TResult1> | undefined | null,
    onrejected?: (
      reason: any
    ) => TResult2 | PromiseLike<TResult2> | undefined | null
  ): PromiseLike<TResult1 | TResult2>;
}

// type thenable = T extends {then: any}

export class MyPromise<T> {
  private _state: STATE = STATE.PENDING;
  private chain: ThenCallback<T>[] = [];
  private value: T | PromiseLike<T>;

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

  resolve(value?: T | PromiseLike<T>): PromiseLike<T> {
    if (this._state !== STATE.PENDING) {
      return;
    }

    if (isThenable(value)) {
      try {
        return value.then.call(
          value,
          v => this.resolve(v),
          err => this.reject(err)
        );
      } catch (err) {
        return this.reject(err);
      }
    }

    this._state = STATE.FULLFILLED;
    this.value = value;

    this.chain.forEach(({ onfullfilled }) => {
      setImmediate(() => {
        onfullfilled(value);
      });
    });
  }

  reject(reason?: any): PromiseLike<T> {
    if (this._state !== STATE.PENDING) {
      if (this._state === STATE.FULLFILLED) {
        throw new Error(
          `can't be called when the state equal to ${STATE.FULLFILLED}`
        );
      }
      return;
    }

    this._state = STATE.REJECTED;
    this.chain.forEach(({ onrejected }) => {
      setImmediate(reason => onrejected(reason));
    });
  }

  then<TResult1 = T, TResult2 = never>(
    _onfullfilled: (value?: T | PromiseLike<T>) => TResult1 | void,
    _onrejected?: (reason?: any) => TResult2
  ): any {
    _onfullfilled = isFunction(_onfullfilled) ? _onfullfilled : () => {};

    _onrejected = isFunction(_onrejected)
      ? _onrejected
      : err => {
          throw err;
        };
    /**
     * then 返回一个promise，then的回调结果作为resolve的结果
     * then的_onrejected如果没有抛出错误，那么该then的promise也需要resolve
     */
    return new MyPromise((resolve, reject) => {
      const onfullfilled = (res: T | PromiseLike<T>) =>
        setImmediate(() => resolve(_onfullfilled(res)));
      const onrejected = () => {
        try {
          setImmediate(() => resolve(_onrejected()));
        } catch (e) {
          reject(e);
        }
      };

      const { _state, value } = this;

      if (_state === STATE.FULLFILLED) {
        return onfullfilled(value);
      }

      if (_state === STATE.REJECTED) {
        return onrejected();
      }

      this.chain.push({ onfullfilled, onrejected });
    });
  }

  get state() {
    return this._state;
  }
}
