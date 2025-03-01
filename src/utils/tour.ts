import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const createTour = (steps: { element: string; popover: { title: string; description: string; } }[]) => {
  const driverObj = driver({
    animate: true,
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    steps: steps.map(step => ({
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        align: 'center',
      }
    }))
  });

  return driverObj;
};

export const startTourIfFirstVisit = (tourName: string, steps: { element: string; popover: { title: string; description: string; } }[]) => {
  const hasSeenTour = localStorage.getItem(`tour-${tourName}`);
  
  if (!hasSeenTour) {
    const tourDriver = createTour(steps);
    setTimeout(() => {
      tourDriver.drive();
      localStorage.setItem(`tour-${tourName}`, 'true');
    }, 1000);
  }
};