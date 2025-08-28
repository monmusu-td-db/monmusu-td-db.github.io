import Header from "@/components/UI/Header";
import { Container } from "react-bootstrap";

function App() {
  return (
    <>
      <Header />
      <Container className="md-content">
        <h1>お問い合わせ</h1>
        <p>誤字脱字、データの誤認などがあればお知らせください。</p>
      </Container>
    </>
  );
}

export default App;
