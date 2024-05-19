type ThrowsErrorOrReturn<E extends Error, T> = T;
type ThrowsError<E extends Error> = void;
type Callback<Function = () => Promise<void>> = Function;
