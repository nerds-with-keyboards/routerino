declare function Routerino({ routes, host, notFoundTemplate, notFoundTitle, errorTemplate, errorTitle, useTrailingSlash, usePrerenderTags, titlePrefix, titlePostfix, imageUrl, }: {
    routes: any;
    host: any;
    notFoundTemplate: any;
    notFoundTitle: any;
    errorTemplate: any;
    errorTitle: any;
    useTrailingSlash: any;
    usePrerenderTags: any;
    titlePrefix: any;
    titlePostfix: any;
    imageUrl: any;
}): any;
declare namespace Routerino {
    namespace defaultProps {
        let routes: {
            path: string;
            element: any;
            description: string;
            tags: {
                property: string;
                content: string;
            }[];
        }[];
        let host: string;
        let notFoundTemplate: any;
        let notFoundTitle: string;
        let errorTemplate: any;
        let errorTitle: string;
        let useTrailingSlash: boolean;
        let usePrerenderTags: boolean;
        let titlePrefix: string;
        let titlePostfix: string;
    }
    namespace propTypes {
        let routes_1: any;
        export { routes_1 as routes };
        let host_1: any;
        export { host_1 as host };
        let notFoundTemplate_1: any;
        export { notFoundTemplate_1 as notFoundTemplate };
        let notFoundTitle_1: any;
        export { notFoundTitle_1 as notFoundTitle };
        let errorTemplate_1: any;
        export { errorTemplate_1 as errorTemplate };
        let errorTitle_1: any;
        export { errorTitle_1 as errorTitle };
        let useTrailingSlash_1: any;
        export { useTrailingSlash_1 as useTrailingSlash };
        let usePrerenderTags_1: any;
        export { usePrerenderTags_1 as usePrerenderTags };
        let titlePrefix_1: any;
        export { titlePrefix_1 as titlePrefix };
        let titlePostfix_1: any;
        export { titlePostfix_1 as titlePostfix };
        export let imageUrl: any;
    }
}
export default Routerino;
