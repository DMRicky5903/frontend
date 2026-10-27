import { Navigate, Outlet, useLocation } from "react-router";

import { useOrientation } from "./useOrientation";

export function RequireLandscapeOutlet() {
  const { isLandscape } = useOrientation();
  const location = useLocation();

  if (!isLandscape) {
    return (
      <Navigate
        to="/orientation"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
