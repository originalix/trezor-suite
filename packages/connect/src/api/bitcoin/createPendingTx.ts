import BigNumber from 'bignumber.js';

import { Transaction as BitcoinJsTransaction } from '@trezor/utxo-lib';
import { getSerializedPath } from '../../utils/pathUtils';
import { PROTO } from '../../constants';

import type { AccountAddresses, AccountUtxo } from '../../types';

export const createPendingTransaction = (
    tx: BitcoinJsTransaction,
    {
        utxo,
        addresses,
        inputs,
        outputs,
    }: {
        utxo: AccountUtxo[];
        addresses: AccountAddresses;
        inputs: PROTO.TxInputType[];
        outputs: PROTO.TxOutputType[];
    },
) => {
    const valueOut = outputs.reduce(
        (sum, out) => BigNumber(sum).plus(out.amount),
        new BigNumber('0'),
    );
    const valueIn = inputs.reduce(
        (sum, ins) => BigNumber(sum).plus(ins.amount),
        new BigNumber('0'),
    );
    return {
        txid: tx.getId(),
        hex: tx.toHex(),
        blockHeight: 0,
        blockTime: Math.floor(Date.now() / 1000),
        confirmations: 0,
        vsize: tx.virtualSize(),
        size: tx.weight(),
        value: valueOut.toString(),
        valueIn: valueIn.toString(),
        fees: valueIn.minus(valueOut).toString(),
        vin: inputs.map((ins, n) => ({
            n,
            txid: ins.prev_hash,
            vout: ins.prev_index,
            isAddress: true,
            addresses: utxo!
                .filter(utxo => utxo.txid === ins.prev_hash && utxo.vout === ins.prev_index)
                .map(utxo => utxo.address),
            value: ins.amount.toString(),
        })),
        vout: outputs.map((out, n) => {
            let transformedAddresses: string[] = [];

            if (out.address) {
                transformedAddresses = [out.address];
            } else if ('op_return_data' in out) {
                transformedAddresses = [
                    `OP_RETURN (${Buffer.from(out.op_return_data, 'hex').toString('ascii')})`,
                ];
            } else {
                transformedAddresses = [
                    ...addresses!.change,
                    ...addresses!.unused,
                    ...addresses!.used,
                ]
                    .filter(
                        address =>
                            out.address_n && address.path === getSerializedPath(out.address_n),
                    )
                    .map(address => address.address);
            }

            return {
                n,
                isAddress: out.script_type !== 'PAYTOOPRETURN',
                addresses: transformedAddresses,
                value: out.amount.toString(),
            };
        }),
    };
};
