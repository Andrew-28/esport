import React from "react";
import { MDBFooter, MDBContainer, MDBIcon, MDBBtn } from "mdb-react-ui-kit";
import "mdb-react-ui-kit/dist/css/mdb.min.css";

export default function Footer() {
  return (
    <MDBFooter id="footer" className="bg-dark text-center text-white">
      <MDBContainer className="p-4 pb-0">
        <section>
          <MDBBtn
            outline
            color="light"
            floating
            className="m-1"
            href="https://www.facebook.com/kpednipro"
            role="button"
            target="_blank"
          >
            <MDBIcon fab icon="facebook-f" />
          </MDBBtn>

          <MDBBtn
            outline
            color="light"
            floating
            className="m-1"
            href="https://ednipro.dp.ua"
            role="button"
            target="_blank"
          >
            <MDBIcon fab icon="google" />
          </MDBBtn>

          <MDBBtn
            outline
            color="light"
            floating
            className="m-1"
            href="https://www.instagram.com/ednipro"
            role="button"
            target="_blank"
          >
            <MDBIcon fab icon="instagram" />
          </MDBBtn>

          <MDBBtn
            outline
            color="light"
            floating
            className="m-1"
            href="https://t.me/kp_ednipro"
            role="button"
            target="_blank"
          >
            <MDBIcon fab icon="telegram" />
          </MDBBtn>
        </section>
      </MDBContainer>

      <div
        className="text-center p-3"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
      >
        © 2024 КП єДніпро
      </div>
    </MDBFooter>
  );
}
