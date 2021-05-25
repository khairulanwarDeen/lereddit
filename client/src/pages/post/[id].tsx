import { Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { Layout } from "../../components/layout";
import { useGetpostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

export const Post = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, error, fetching }] = useGetpostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  if (fetching) {
    return <Layout>Loading ...</Layout>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  if (!data?.getpost) {
    return <Layout>Post does not exist</Layout>;
  }
  return (
    <Layout>
      <Heading>{data.getpost.title}</Heading>
      {data.getpost.text}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
