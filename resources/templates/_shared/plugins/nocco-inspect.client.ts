// Development only: lets the Nocco preview ask the user to pick an element on
// the page. The preview turns picking on with a message; the next click is
// reported back instead of reaching the page. A built app does nothing here.
export default defineNuxtPlugin(() => {
  if (!import.meta.dev || window.parent === window) return;
  let picking = false;
  const frame = document.createElement('div');
  frame.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;border:2px solid #2f6fed;background:rgba(47,111,237,0.12);border-radius:3px;display:none';

  /** The source file of the nearest component of this app that renders the element. */
  const componentFile = (element: Element): string => {
    let instance = (element as unknown as { __vueParentComponent?: { type?: { __file?: string }; parent?: unknown } }).__vueParentComponent;
    while (instance) {
      const file = instance.type?.__file;
      if (file && !file.includes('node_modules')) return file;
      instance = instance.parent as typeof instance;
    }
    return '';
  };

  const outline = (element: Element | null): void => {
    if (!element) { frame.style.display = 'none'; return; }
    const box = element.getBoundingClientRect();
    Object.assign(frame.style, { display: 'block', left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
  };
  const under = (event: MouseEvent): Element | null => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    return element && element !== document.documentElement && element !== document.body ? element : null;
  };
  const stop = (): void => {
    picking = false;
    frame.remove();
    document.documentElement.style.cursor = '';
  };

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.type !== 'nocco:inspect') return;
    picking = event.data.on === true;
    if (!picking) return stop();
    document.body.appendChild(frame);
    document.documentElement.style.cursor = 'crosshair';
  });
  window.addEventListener('mousemove', (event) => { if (picking) outline(under(event)); }, true);
  window.addEventListener('keydown', (event) => {
    if (!picking || event.key !== 'Escape') return;
    stop();
    window.parent.postMessage({ type: 'nocco:picked', element: null }, '*');
  }, true);
  // While picking, a click selects; it must not also press the thing it lands on.
  for (const name of ['mousedown', 'mouseup', 'click'] as const) {
    window.addEventListener(name, (event) => {
      if (!picking) return;
      event.preventDefault();
      event.stopPropagation();
      if (name !== 'click') return;
      const element = under(event);
      stop();
      window.parent.postMessage({
        type: 'nocco:picked',
        element: element && {
          tag: element.tagName.toLowerCase(),
          text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
          classes: [...element.classList].slice(0, 6).join(' '),
          file: componentFile(element),
          page: location.pathname,
        },
      }, '*');
    }, true);
  }
});
