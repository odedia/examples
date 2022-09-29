import React from 'react'

export function useInterval(callback: () => void, delay: number | null) {
  const cb = React.useRef(callback)

  React.useEffect(() => {
    cb.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return
    }

    const id = setInterval(() => cb.current(), delay)

    return () => clearInterval(id)
  }, [delay])
}

export default useInterval
