import * as React from 'react';
import PropTypes from 'prop-types';
import initHistory, { Traveler } from './history';
import { from, Stream } from 'most';
import { Engine, EngineSubject } from './engine/most';
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
export const REACT_MOST_ENGINE = '@@reactive-react/react-most.engine';

const CONTEXT_TYPE = {
  [REACT_MOST_ENGINE]: PropTypes.object
};

interface History<T> extends Stream<T> {
  cursor: number
  travel: Stream<T>
  forward: () => void
  backward: () => void
}
interface Actions<T> {
  [propName: string]: (...v: any[]) => T
}
interface Props {
  [propName: string]: any
}
interface Plan<T> {
  (intent: EngineSubject<T>, props?: Props): Process<T>
}
interface Update<S> {
  (current: S): S
}
interface Process<T> {
  actions: Actions<T>,
  updates: Stream<Update<T>>
}

interface ConnectProps<T> {
  actions: Actions<T>
}
interface ReactClass { }
interface Connect {
  contextTypes?: any
  new (props?, context?): any
}
const h = React.createElement;
function connect<T>(main: Plan<T>, opts = { history: false }): (rc: React.ComponentClass<Props>) => React.ComponentClass<ConnectProps<T>> {
  return function(WrappedComponent: React.ComponentClass<Props>) {
    let connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`;
    if (WrappedComponent.contextTypes === CONTEXT_TYPE) {
      return class ConnectNode extends React.PureComponent<ConnectProps<T>, any>{
        actions: Actions<T>
        updates: Stream<Update<T>>
        props: ConnectProps<T>
        static contextTypes = CONTEXT_TYPE
        static displayName = connectDisplayName
        constructor(props: ConnectProps<T>, context) {
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
      return class ConnectLeaf<T, S> extends React.PureComponent<ConnectProps<T>, S> {
        actions: Actions<T>
        updates: Stream<Update<T>>
        props: ConnectProps<T>
        traveler: Traveler<S>
        constructor(props, context) {
          super(props, context);
          let engine: Engine<T, S> = context[REACT_MOST_ENGINE]
          if (opts.history || props.history) {
            this.traveler = initHistory(engine.historyStream, engine.travelStream);
            this.traveler.travel.forEach(state => {
              return this.setState(state);
            });
          }

          let { actions, updates } = main(engine.intentStream, props)
          this.updates = updates.merge(props.updates)
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
          this.subscriptions = this.context[REACT_MOST_ENGINE].observe(
            this.updates,
            action => {
              if (action instanceof Function) {
                this.setState((prevState, props) => {
                  let newState = action.call(this, prevState, props);
                  if (opts.history && newState != prevState) {
                    opts.history.cursor = -1;
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
          this.subscriptions.unsubscribe();
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
    let engine: Engine<I, H> = (this.props && this.props.engine && new this.props.engine) || new Engine<I, H>();
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
