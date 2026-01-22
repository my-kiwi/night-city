const state = { count: 0 };

const increaseCounter = (targetId: string) => {
  const increase_counter_event = 'increase_counter_event';

  window.addEventListener(increase_counter_event, () => {
    state.count++;
    document.getElementById(targetId)!.textContent = `${state.count}`;
  });
  return `window.dispatchEvent(new Event('${increase_counter_event}'))`;
};

export const Counter = () => {
  return `
    <p>Click here to increment:</p>
      <button onClick="${increaseCounter('counter')}">Increase</button>
    <p>
      Current count: <span id="counter">${state.count}</span>
    </p>
  `;
};
