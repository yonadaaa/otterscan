import React from "react";
import { NavLink } from "react-router-dom";

type StoreTableLinkProps = {
  address: string;
  name: string;
  text?: string;
  dontOverrideColors?: boolean;
};

const StoreTableLink: React.FC<StoreTableLinkProps> = ({
  address,
  name,
  text,
  dontOverrideColors,
}) => (
  <NavLink
    className={`${
      dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
    } truncate font-address`}
    to={`/address/${address}/store/${name}`}
  >
    <span className="truncate" title={text ?? address}>
      {text ?? `${address}/${name}`}
    </span>
  </NavLink>
);

export default StoreTableLink;
