import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from 'urql';
import { pipe, tap } from "wonka";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from './../../../src/generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import gql from 'graphql-tag';
import { isServer } from './isServer';

export const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error send a request to sentry
      if (error) {
        if (error?.message.includes("not Authenticated")) {
          //use replace to redirect, so the user cant go back to the page they 
          //werent allowed to be on
          Router.replace("/login")
        }
      }
    })
  );
};

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    console.log(entityKey, fieldName)
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, "posts");
    info.partial = !isItInTheCache;
    const results: string[] = [];
    let hasMore = true;
    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const hasMore_ = cache.resolve(key, "hasMore");
      if (!hasMore_) {
        hasMore = hasMore_ as boolean;
      }
      console.log("data: ", data, " hasMore: ", hasMore);
      results.push(...data);
    })

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results
    };


    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[offsetArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {

  let cookie = ''
  if (isServer()) {
    cookie = ctx.req.headers.cookie
  }


  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? {
        cookie,
      } : undefined
    },
    exchanges: [dedupExchange, cacheExchange({
      keys: {
        PaginatedPosts: () => null
      },
      resolvers: {
        Query: {
          getposts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          vote: (_result, args, cache, _info) => {
            const { postId, value } = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
              fragment _ on Post{
                id
                points
                voteStatus
              }
              `,
              { id: postId } as any
            );
            if (data) {
              if (data.voteStatus === args.value) {
                return;
              }
              const newPoints = (data.point as number) + (!data.voteStatus ? value : 2 * value);
              cache.writeFragment(
                gql`
              fragment __ on Post {
                points
                voteStatus
              }
              `,
                { id: postId, points: newPoints, voteStatus: value } as any
              )
            }
          },
          createPost: (_result, _args, cache, _info) => {
            const allFields = cache.inspectFields("Query");
            const fieldInfos = allFields.filter(
              (info) => info.fieldName === "posts"
            );
            fieldInfos.forEach((fi) => {
              cache.invalidate('Query', 'posts', fi.arguments || {});
            });
          },
          login: (_result, _args, cache, _info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              })
          },
          register: (_result, _args, cache, _info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              })
          },
          logout: (_result, _args, cache, _info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            )
          }
        },
      },
    }),
      errorExchange,
      ssrExchange,
      fetchExchange],

  }
}