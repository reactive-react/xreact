import React from 'react';
import PropTypes from 'prop-types';
import initHistory from './history';
import { from } from 'most';
import mostEngine from './engine/most';
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
export const INTENT_STREAM = '@@reactive-react/react-most.intentStream';
export const HISTORY_STREAM = '@@reactive-react/react-most.historyStream';
const MERGE_OBSERVE = '@@reactive-react/react-most.mergeObserve';

const CONTEXT_TYPE = {
  [INTENT_STREAM]: PropTypes.object,
  [HISTORY_STREAM]: PropTypes.object,
  [MERGE_OBSERVE]: PropTypes.func,
};
interface State {}
interface Stream<T> {}
interface Actions<T> {
  [propName: string]: (...v:any[])=>T
}
interface Props {
  [propName: string]: any
}
interface Plan<T> {
  (intent: Stream<T>, props?: Props): Process<T>
}
interface Update<T> {
  (current: State): State
}
interface Process<T> {
  actions: Actions<T>,
  sink$: Stream<Update<T>>
}

interface ConnectProps {
  contextTypes: any
}
interface ReactClass {}
interface Connect{
  contextTypes?: any
  new(props?, context?): any
}
const h = React.createElement;
function connect<T>(main: Plan<T>, opts = {}): (rc: typeof React.PureComponent)=>typeof React.PureComponent{
  return function(WrappedComponent: typeof React.PureComponent){
    let connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`;
    if (WrappedComponent === ConnectNode) {
      return class ConnectNode extends React.PureComponent<any, any>{
        actions: Actions<T>
        sink$: Stream<Update<T>>
        static contextTypes = CONTEXT_TYPE
        static displayName = connectDisplayName
        constructor(props, context) {
          super(props, context);
          let {actions, sink$} = main(context[INTENT_STREAM], props)
          this.sink$ = sink$
          this.actions = Object.assign({}, actions, props.actions);
        }
        render() {
          return h(
            WrappedComponent,
            Object.assign({}, this.props, opts, {
              sink$: this.sink$,
              actions: this.actions,
            })
          );
        }
      }
    } else {
      class ConnectLeaf extends React.PureComponent {
        constructor(props, context) {
          super(props, context);
          if (opts.history || props.history) {
            opts.history = initHistory(context[HISTORY_STREAM]);
            opts.history.travel.forEach(state => {
              return this.setState(state);
            });
          }

          let [actions, sink$] = actionsAndSinks(
            main(context[INTENT_STREAM], props),
            this
          );
          this.sink$ = sink$.concat(props.sink$ || []);
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
          this.subscriptions = this.context[MERGE_OBSERVE](
            this.sink$,
            action => {
              if (action instanceof Function) {
                this.setState((prevState, props) => {
                  let newState = action.call(this, prevState, props);
                  if (opts.history && newState != prevState) {
                    opts.history.cursor = -1;
                    this.context[HISTORY_STREAM].send(prevState);
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
      Connect.contextTypes = CONTEXT_TYPE;
      Connect.displayName = connectDisplayName;
      return Connect;
    }
  };
}

export default class Most extends React.PureComponent {
  getChildContext() {
    let engineClass = (this.props && this.props.engine) || mostEngine;
    let engine = engineClass();
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'debug') {
      inspect(engine);
    }
    return {
      [INTENT_STREAM]: engine.intentStream,
      [MERGE_OBSERVE]: engine.mergeObserve,
      [HISTORY_STREAM]: engine.historyStream,
    };
  }
  render() {
    return React.Children.only(this.props.children);
  }
}
Most.childContextTypes = CONTEXT_TYPE;

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

function actionsAndSinks<T>(sinks: Stream<Update<T>>, self) {
  let _sinks = [];
  let _actions = {
    fromEvent(e, f = x => x) {
      return self.context[INTENT_STREAM].send(f(e));
    },
    fromPromise(p) {
      return p.then(x => self.context[INTENT_STREAM].send(x));
    },
  };
  for (let name in sinks) {
    let value = sinks[name];
    if (observable(value)) {
      _sinks.push(value);
    } else if (value instanceof Function) {
      _actions[name] = (...args) => {
        return self.context[INTENT_STREAM].send(value.apply(self, args));
      };
    } else if (name === 'actions') {
      for (let a in value)
        _actions[a] = (...args) => {
          return self.context[INTENT_STREAM].send(value[a].apply(self, args));
        };
    }
  }
  return [_actions, _sinks];
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}