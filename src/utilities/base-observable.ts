import {Observable} from 'rxjs/Observable';
import {Subscriber, Subscription, Observer} from "rxjs";

export class BaseObservable<T> extends Observable<T> {
    protected subscribers: {[key: string]: Subscriber<T>} = {};
    private subscriberId: number = 0;
    constructor() {
        super((subscriber: Subscriber<T>) => {
            let key = this.getNewId();
            this.subscribers[key] = subscriber;
            return new BaseObservableSubscription(() => {
                delete this.subscribers[key];
            });
        });
    }

    private getNewId(): string {
        this.subscriberId += Number.MIN_VALUE;
        return this.subscriberId.toString();
    }
}

export class BaseObservableSubscription extends Subscription {
  constructor(remove: () => void) {
    super(remove);
  } 
}