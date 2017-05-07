import * as React from 'react';
import { PropTypes } from 'prop-types';
import initHistory, { Traveler } from './history';
import { from, Stream, Subscription } from 'most';
import { Engine, EngineSubject } from './engine/most';
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
export const REACT_MOST_ENGINE = '@@reactive-react/react-most.engine';

const CONTEXT_TYPE = {
  [REACT_MOST_ENGINE]: PropTypes.object
};

export interface Actions<T> {
  [propName: string]: (...v: any[]) => T
}

export interface Plan<I, S> {
  (intent: EngineSubject<I>, props?: {}): Process<I, S>
}
export interface Update<S> {
  (current: S): S
}
export interface Process<I, S> {
  actions: Actions<I>,
  updates: Stream<Update<S>>
}

export interface ConnectProps<I> {
  actions: Actions<I>
}
const h = React.createElement;
export class Connect<I, S> extends React.PureComponent<ConnectProps<I>, S> {
  actions: Actions<I>
  updates: Stream<Update<S>>
}
export interface ConnectClass<I, S> {
  new (props?: ConnectProps<I>, context?: any): Connect<I, S>;
}
export function connect<I, S>(main: Plan<I, S>, opts = { history: false }): (WrappedComponent: React.ComponentClass<any>) => ConnectClass<I, S> {
  return function(WrappedComponent: React.ComponentClass<any>) {
    let connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`;
    if (WrappedComponent.contextTypes === CONTEXT_TYPE) {
      return class ConnectNode extends Connect<I, S>{
        actions: Actions<I>
        updates: Stream<Update<S>>
        static contextTypes = CONTEXT_TYPE
        static displayName = connectDisplayName
        constructor(props: ConnectProps<I>, context) {
          super(props, context);
          let { actions, updates } = main(context[REACT_MOST_ENGINE].historyStream, props)
          this.updates = updates
          this.actions = Object.assign({}, actions, props.actions);
        }
        render() {
          return h(
            WrappedComponent,
            Object.assign({}, this.props, opts, {
              updates: this.updates,
              actions: this.actions,
            })
          );
        }
      }
    } else {
      return class ConnectLeaf extends Connect<I, S> {
        actions: Actions<I>
        updates: Stream<Update<S>>
        traveler: Traveler<S>
        subscription: Subscription<S>
        constructor(props, context) {
          super(props, context);
          let engine: Engine<I, S> = context[REACT_MOST_ENGINE]
          if (opts.history || props.history) {
            this.traveler = initHistory(engine.historyStream, engine.travelStream);
            this.traveler.travel.forEach(state => {
              return this.setState(state);
            });
          }

          let { actions, updates } = main(context[REACT_MOST_ENGINE].engine.intentStream, props)
          this.updates = props.updates ? updates.merge(props.updates) : updates
          this.actions = Object.assign({}, actions, props.actions);
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
            this.updates,
            action => {
              if (action instanceof Function) {
                this.setState((prevState, props) => {
                  let newState = action.call(this, prevState, props);
                  if (opts.history && newState != prevState) {
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
            Object.assign({}, this.props, this.state, opts, {
              actions: this.actions,
            })
          );
        }
      }
    }
  };
}

export interface MostProps<T, S> {
  engine?: Engine<T, S>
}
export interface MostEngine<I, H> {
  [x: string]: Engine<I, H>
}
export default class Most<I, H, S> extends React.PureComponent<MostProps<I, H>, S> {
  static childContextTypes = CONTEXT_TYPE
  getChildContext(): MostEngine<I, H> {
    let engine: Engine<I, H> = (this.props && this.props.engine) || new Engine<I, H>();
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

function observable(obj) {
  return !!obj.subscribe;
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
