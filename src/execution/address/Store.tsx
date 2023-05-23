import React from "react";
import { AddressAwareComponentProps } from "../types";
import StoreTableLink from "../../components/StoreTableLink";
import StandardTBody from "../../components/StandardTBody";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import StandardTHead from "../../components/StandardTHead";
import StandardTable from "../../components/StandardTable";
import ContentFrame from "../../components/ContentFrame";

const Store: React.FC<AddressAwareComponentProps> = ({ address }) => {
  return (
    <ContentFrame tabs>
      <StandardTable>
        <StandardTHead>
          <th>Table name</th>
        </StandardTHead>
        <StandardSelectionBoundary>
          <StandardTBody>
            <tr>
              {" "}
              <td>
                <StoreTableLink
                  address={address}
                  name={"CounterTable"}
                  text={"CounterTable"}
                />{" "}
              </td>
            </tr>
            <tr>
              <td>
                <StoreTableLink
                  address={address}
                  name={"Inventory"}
                  text={"Inventory"}
                />
              </td>
            </tr>
          </StandardTBody>
        </StandardSelectionBoundary>
      </StandardTable>
    </ContentFrame>
  );
};

export default React.memo(Store);
