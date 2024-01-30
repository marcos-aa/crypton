import ModalContainer from "../../../ModalContainer";
import ValidateUser from "../../../ValidateUser";

interface ValidModal {
  origin: string;
}

export default function ValidationModal({ origin }: ValidModal) {
  return (
    <ModalContainer id="innerModal" predecessor={origin}>
      <ValidateUser />
    </ModalContainer>
  );
}
