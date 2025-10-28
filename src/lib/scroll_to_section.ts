// Define this function somewhere in your component or a utils file
  const myScrollTo = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
export default myScrollTo ;

