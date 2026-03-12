import { useEffect } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

const TOUR_STORAGE_KEY = "ur-demo-tour-completed"
const TOUR_EVENT = "ur-demo:start-tour"

export function FirstRunTour() {
  useEffect(() => {
    function startTour() {
      const tour = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Done",
        steps: [
          {
            element: "#tour-partner-private-key",
            popover: {
              title: "Start with the partner key",
              description:
                "Paste the demo partner private key first. This key is used to sign requests directly in the browser.",
            },
          },
          {
            element: "#tour-refresh-state",
            popover: {
              title: "Fetch account info and balances",
              description:
                "This loads the latest user profile and balances. Offramp, Onramp, and FX all depend on this step.",
            },
          },
          {
            element: "#tour-offramp-quote",
            popover: {
              title: "Get the Offramp quote first",
              description:
                "It is clearer to fetch the quote first so you can confirm the input and output for this deposit.",
            },
          },
          {
            element: "#tour-offramp-execute",
            popover: {
              title: "Then execute Offramp",
              description:
                "Run Offramp after the quote is ready to avoid triggering the final action too early.",
            },
          },
          {
            element: "#tour-console-panel",
            popover: {
              title: "Review requests and responses here",
              description:
                "The center panel shows URL, headers, request body, response, and explorer links for troubleshooting.",
            },
          },
          {
            element: "#tour-status-panel",
            popover: {
              title: "Watch result changes here",
              description:
                "The right-side status panel shows profile and balance updates. Changed fields will be highlighted after a successful action.",
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem(TOUR_STORAGE_KEY, "1")
        },
      })

      tour.drive()
    }

    const handleStart = () => {
      window.setTimeout(startTour, 250)
    }

    window.addEventListener(TOUR_EVENT, handleStart)

    if (!localStorage.getItem(TOUR_STORAGE_KEY)) handleStart()

    return () => {
      window.removeEventListener(TOUR_EVENT, handleStart)
    }
  }, [])

  return null
}
