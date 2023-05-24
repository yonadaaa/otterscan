import React, { useEffect, useState } from "react";
import { Contract, utils } from "ethers";
import { BytesLike } from "ethers/lib/utils";
import { TableId, range } from "@latticexyz/utils";
import { useProvider } from "../../useProvider";
import { RawTableRecord, getSnapSyncRecords } from "@latticexyz/network";
import StandardTHead from "../../components/StandardTHead";
import StandardTable from "../../components/StandardTable";
import StandardTBody from "../../components/StandardTBody";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import ContentFrame from "../../components/ContentFrame";
import StandardFrame from "../../components/StandardFrame";
import InfoRow from "../../components/InfoRow";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import { decodeSchema } from "./decodeSchema";
import { decodeKeyTuple } from "./decodeKeyTuple";
import { useConfig } from "../../useConfig";
import { decodeData } from "./decodeData";
import { useParams } from "react-router-dom";
import StandardSubtitle from "../../components/StandardSubtitle";
import { JsonRpcProvider } from "@ethersproject/providers";

const abi = [
  "function getKeySchema(bytes32) public view returns (bytes32)",
  "function getSchema(bytes32) public view returns (bytes32)",
  "function getRecord(bytes32,bytes32[]) public view returns (bytes)",
  "function getField(bytes32,bytes32[],uint8) public view returns (bytes)",
];

const metadataTableId = new TableId("mudstore", "StoreMetadata");

const StoreTable: React.FC = () => {
  const { addressOrName, name } = useParams();

  if (!addressOrName || !name) {
    return <div>Enter an address and name.</div>;
  }

  const tableId = new TableId("", name);

  const config = useConfig();
  const provider = useProvider(config?.erigonURL);

  const [schema, setSchema] = useState<any>();
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [records, setRecords] = useState<RawTableRecord[]>([]);

  useEffect(() => {
    if (provider[1]) {
      const world = new Contract(addressOrName, abi, provider[1]);

      const rawKeySchemaPromise = world.getKeySchema(tableId);
      const rawValueSchemaPromise = world.getSchema(tableId);
      const rawSchemaPromise = Promise.all([
        rawKeySchemaPromise,
        rawValueSchemaPromise,
      ]).then(
        ([rawKeySchema, rawValueSchema]) =>
          rawValueSchema + rawKeySchema.substring(2)
      );
      rawSchemaPromise.then((rawSchema: string) => {
        const decodedSchema = decodeSchema(rawSchema);
        if (decodedSchema.valueSchema.isEmpty) {
          console.warn("Schema not found for table", {
            table: tableId,
            world: world.address,
          });
        }

        setSchema(decodedSchema);
      });

      world.getField(metadataTableId, [tableId], 1).then((data: BytesLike) => {
        const result = utils.defaultAbiCoder
          .decode(["string[]"], data)
          .map((r) => r.toString());

        setFieldNames(result);
      });

      provider[1].getBlockNumber().then((blockNumber) => {
        getSnapSyncRecords(
          addressOrName,
          [TableId.fromHexString(tableId.toHexString())],
          blockNumber,
          provider[1] as JsonRpcProvider
        ).then(setRecords);
      });
    }
  }, [provider]);

  const parsed = records.map((record) => {
    const { valueSchema, keySchema } = schema;
    const indexedValues = decodeData(valueSchema, record.value);
    const indexedKey = decodeKeyTuple(keySchema, record.keyTuple);

    return { indexedKey, indexedValues };
  });

  return (
    <StandardFrame>
      <StandardSubtitle>
        {tableId.namespace}:{tableId.name}
      </StandardSubtitle>
      <ContentFrame tabs>
        <InfoRow title="World">
          <DecoratedAddressLink address={addressOrName} plain />
        </InfoRow>
        <div className="flex items-baseline justify-between py-3">
          <div className="text-sm text-gray-500">
            {records.length} records in this table
          </div>
        </div>
        <StandardTable>
          <StandardTHead>
            {schema &&
              Array.from(range(schema.keySchema.staticFields.length, 1, 0)).map(
                (i) => <th key={i}>Key {i}</th>
              )}
            {fieldNames.map((fieldName) => (
              <th key={fieldName}>{fieldName}</th>
            ))}
          </StandardTHead>
          <StandardSelectionBoundary>
            <StandardTBody>
              {parsed.map((p) => (
                <tr>
                  {Object.values(p.indexedKey).map((key, i) => (
                    <td>
                      {schema.keySchema.staticFields[i] === 97 ? (
                        <DecoratedAddressLink address={key as string} plain />
                      ) : (
                        <div>{key as string}</div>
                      )}
                    </td>
                  ))}
                  {Object.values(p.indexedValues).map((key, i) => (
                    <td>
                      {schema.valueSchema.staticFields[i] === 97 ? (
                        <DecoratedAddressLink address={key} plain />
                      ) : (
                        <div>{key}</div>
                      )}{" "}
                    </td>
                  ))}
                </tr>
              ))}
            </StandardTBody>
          </StandardSelectionBoundary>
        </StandardTable>
      </ContentFrame>
    </StandardFrame>
  );
};

export default React.memo(StoreTable);
