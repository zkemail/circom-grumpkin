jest.setTimeout(120000)
// import { getPublicKey, Point } from '@noble/secp256k1';
const crypto = require('crypto')
const ff = require('ffjavascript')
const stringifyBigInts = ff.utils.stringifyBigInts
// import {
//     callGenWitness as genWitness,
//     callGetSignalByName as getSignalByName,
// } from 'circom-helper'
import * as path from "path";
import { hash_to_field, map_to_curve, point_add, point_double, point_scalar_mul, str_to_array } from "..";
const circom_tester = require("circom_tester");
const wasm_tester = circom_tester.wasm;



describe('PointMul', () => {
    it('2a = a + a', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/point_double_test.circom"));
        const msg = str_to_array("abc");
        const us = hash_to_field(msg);
        const point0 = map_to_curve(us[0]);
        const circuitInputs = stringifyBigInts({
            a: [point0.x, point0.y],
        });
        const witness = await circuit.calculateWitness(circuitInputs);
        await circuit.checkConstraints(witness);
        const expected_point = point_double(point0.x, point0.y);
        expect(witness[1]).toEqual(expected_point.x);
        expect(witness[2]).toEqual(expected_point.y);
    })

    it(`3a = 2a + a`, async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/point_mul_test.circom"));
        const msg = str_to_array("abc");
        const us = hash_to_field(msg);
        const point0 = map_to_curve(us[0]);
        const circuitInputs = stringifyBigInts({
            a: [point0.x, point0.y],
            scalar: BigInt(3)
        });
        const witness = await circuit.calculateWitness(circuitInputs);
        await circuit.checkConstraints(witness);
        const doubled_point = point_double(point0.x, point0.y);
        const expected_point = point_add(doubled_point.x, doubled_point.y, point0.x, point0.y);
        expect(witness[1]).toEqual(expected_point.x);
        expect(witness[2]).toEqual(expected_point.y);
    })

})
