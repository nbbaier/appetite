export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      zIndex: {
        dropdown: "10",
        sticky: "20",
        overlay: "40",
        modal: "50",
        popover: "60",
        toast: "70",
      },
    },
  },
};
