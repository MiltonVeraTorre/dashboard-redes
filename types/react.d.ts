// Type definitions for React
declare module 'react' {
  export type FC<P = {}> = React.FunctionComponent<P>;
  
  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
    displayName?: string;
  }
  
  export type ReactNode = 
    | React.ReactElement
    | string
    | number
    | boolean
    | null
    | undefined;
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  export type Key = string | number;
  
  export type JSXElementConstructor<P> = 
    | ((props: P) => ReactElement<any, any> | null)
    | (new (props: P) => Component<any, any>);
  
  export class Component<P = {}, S = {}> {
    constructor(props: P, context?: any);
    props: Readonly<P>;
    state: Readonly<S>;
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I & React.ReducerState<R>,
    initializer?: (arg: I & React.ReducerState<R>) => React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  export function useRef<T = undefined>(initialValue: T): React.MutableRefObject<T>;
  export function useLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  
  export type Reducer<S, A> = (prevState: S, action: A) => S;
  export type Dispatch<A> = (value: A) => void;
  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  export type DependencyList = ReadonlyArray<any>;
  export type EffectCallback = () => (void | (() => void | undefined));
  export interface MutableRefObject<T> {
    current: T;
  }
  
  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }
  
  export interface Provider<T> {
    (props: ProviderProps<T>): ReactElement<any> | null;
  }
  
  export interface Consumer<T> {
    (props: ConsumerProps<T>): ReactElement<any> | null;
  }
  
  export interface ProviderProps<T> {
    value: T;
    children?: ReactNode;
  }
  
  export interface ConsumerProps<T> {
    children: (value: T) => ReactNode;
  }
}
