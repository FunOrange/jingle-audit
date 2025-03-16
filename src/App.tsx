import "./App.css";

function App() {
  return (
    <>
      <h1>hello</h1>
      <div>{import.meta.env.VITE_FIRESTORE_KEY}</div>
    </>
  );
}

export default App;
