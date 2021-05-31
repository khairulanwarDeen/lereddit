import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";

export const EditPost = () => {
  return <div>Hellow edit</div>;
};

export default withUrqlClient(createUrqlClient)(EditPost);
