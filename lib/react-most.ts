import * as React from 'react';
import { PropTypes } from 'prop-types';
import initHistory, { Traveler } from './history';
import { Plan, Actions, Connect, ConnectProps, EngineSubject, Update, ConnectClass } from './interfaces'
import { from, Stream, Subscription, mergeArray } from 'most';
import { Engine } from './engine/most';

// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
export const REACT_MOST_ENGINE = '@@reactive-react/react-most.engine';
const h = React.createElement;
const CONTEXT_TYPE = {
  [REACT_MOST_ENGINE]: PropTypes.object
};

export function connect<I, S>(main: Plan<I, S>, opts = { history: false }): (WrappedComponent: React.ComponentClass<any>) => ConnectClass<I, S> {
  return function(WrappedComponent: ConnectClass<I, S>) {
    let connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`;
    if (WrappedComponent.contextTypes === CONTEXT_TYPE) {
      return class ConnectNode extends WrappedComponent {
        actions: Actions<I>
        update$: Stream<Update<S>>
        main: Plan<I, S>
        static contextTypes = CONTEXT_TYPE
        static displayName = connectDisplayName
        constructor(props, context) {
          super(props, context);
          let { actions, update$ } = main(context[REACT_MOST_ENGINE].intentStream, props)
          this.update$ = this.update$.merge(update$)
          this.actions = Object.assign({}, bindActions(actions, context[REACT_MOST_ENGINE].intentStream, this), this.actions);
        }
      }
    } else {
      return class ConnectLeaf extends Connect<I, S> {
        actions: Actions<I>
        update$: Stream<Update<S>>
        traveler: Traveler<S>
        subscription: Subscription<S>
        main: Plan<I, S>
        static contextTypes = CONTEXT_TYPE
        static displayName = connectDisplayName
        constructor(props, context) {
          super(props, context);
          let engine: Engine<I, S> = context[REACT_MOST_ENGINE]
          if (opts.history || props.history) {
            this.traveler = initHistory(engine.historyStream, engine.travelStream);
            this.traveler.travel.forEach(state => {
              return this.setState(state);
            });
          }
          let { actions, update$ } = main(engine.intentStream, props)
          this.actions = bindActions(actions, engine.intentStream, this)
          this.update$ = update$
          let defaultKey = Object.keys(WrappedComponent.defaultProps);
          this.state = Object.assign(
            {},
            WrappedComponent.defaultProps,
            pick(defaultKey, props)
          );
        }
        componentWillReceiveProps(nextProps) {
          this.setState(state => pick(Object.keys(state), nextProps));
        }
        componentDidMount() {
          this.subscription = this.context[REACT_MOST_ENGINE].observe(
            this.update$,
            action => {
              if (action instanceof Function) {
                this.setState((prevState, props) => {
                  let newState = action.call(this, prevState, props);
                  if ((opts.history || props.history) && newState != prevState) {
                    this.traveler.cursor = -1;
                    this.context[REACT_MOST_ENGINE].historyStream.send(prevState);
                  }
                  return newState;
                });
              } else {
                /* istanbul ignore next */
                console.warn(
                  'action',
                  action,
                  'need to be a Function which map from current state to new state'
                );
              }
            }
          );
        }
        componentWillUnmount() {
          this.subscription.unsubscribe();
        }
        render() {
          return h(
            WrappedComponent,
            Object.assign({}, opts, this.props, this.state, {
              actions: this.actions,
              traveler: this.traveler
            })
          );
        }
      }
    }
  };
}

export interface MostProps<T, S> {
  engine?: new () => Engine<T, S>
}
export interface MostEngine<I, H> {
  [x: string]: Engine<I, H>
}
export default class Most<I, H, S> extends React.PureComponent<MostProps<I, H>, S> {
  static childContextTypes = CONTEXT_TYPE
  getChildContext(): MostEngine<I, H> {
    let engine: Engine<I, H> = (this.props && this.props.engine && new this.props.engine()) || new Engine<I, H>();
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'debug') {
      inspect(engine);
    }
    return {
      [REACT_MOST_ENGINE]: engine
    };
  }
  render() {
    return React.Children.only(this.props.children);
  }
}

/* istanbul ignore next */
function inspect(engine) {
  from(engine.intentStream)
    .timestamp()
    .observe(stamp =>
      console.log(`[${new Date(stamp.time).toJSON()}][INTENT]:}`, stamp.value)
    );
  from(engine.historyStream)
    .timestamp()
    .observe(stamp =>
      console.log(`[${new Date(stamp.time).toJSON()}][STATE]:}`, stamp.value)
    );
}
function bindActions(actions, intent$, self) {
  let _actions = {
    fromEvent(e, f = x => x) {
      return intent$.send(f(e));
    },
    fromPromise(p) {
      return p.then(x => intent$.send(x));
    },
  };

  for (let a in actions) {
    _actions[a] = (...args) => {
      return intent$.send(actions[a].apply(self, args));
    };
  }
  return _actions;
}
function pick(names, obj) {
  let result = {};
  for (let name of names) {
    if (obj[name]) result[name] = obj[name];
  }
  return result;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
