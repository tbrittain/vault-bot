import React from 'react';
import { Route, Switch } from 'react-router-dom';

const ROUTES = [
    {
        path: "/",
        key: "ROOT",
        exact: true,
        component: () => <h1>Index</h1>
    },
    {
        path: "/songs",
        key: "SONGS",
        exact: true,
        component: RenderRoutes,
        routes: [
            {
                path: "/songs/",
                key: "SONGS",
                exact: true,
                component: () => <h1>Total songs</h1>
            },
            {
                path: "/songs/:id",
                key: "SONG",
                exact: true,
                component: () => <h1>Specific song</h1>
            }
        ]
    }
]

/**
 * Render a route with potential sub routes
 * https://reacttraining.com/react-router/web/example/route-config
 */
 function RouteWithSubRoutes(route) {
    return (
      <Route
        path={route.path}
        exact={route.exact}
        render={props => <route.component {...props} routes={route.routes} />}
      />
    );
  }

function RenderRoutes({ routes }) {
    return (
        <Switch>
            {routes.map((route, i) => {
                return <RouteWithSubRoutes key={route.key} {...route} />
            })}
            <Route component={() => <h1>Not found!</h1>} />
        </Switch>
    )
}

export { ROUTES, RenderRoutes }