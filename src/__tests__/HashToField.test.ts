jest.setTimeout(120000)
const ff = require('ffjavascript')
const stringifyBigInts = ff.utils.stringifyBigInts
// import {
//     callGenWitness as genWitness,
//     callGetSignalByName as getSignalByName,
// } from 'circom-helper'
// import { bigint_to_array } from '../utils'
// import {
//     bytes_to_registers,
// } from '../generate_inputs'
import { hash_to_field } from "..";
import * as path from "path";
const circom_tester = require("circom_tester");
const wasm_tester = circom_tester.wasm;

describe('HashToField', () => {
    const msg = [97, 98, 99] // "abc"

    it('HashToField', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/hash_to_field_test.circom"))
        const circuitInputs = stringifyBigInts({ msg })
        const witness = await circuit.calculateWitness(circuitInputs)
        await circuit.checkConstraints(witness);
        const expectedUs = hash_to_field(msg);
        expect(witness[1]).toEqual(expectedUs[0]);
        expect(witness[2]).toEqual(expectedUs[1]);
        // u0
        // const u0_registers: bigint[] = []
        // for (let i = 0; i < 4; i++) {
        //     const out = BigInt(await getSignalByName(circuit, witness, 'main.u[0][' + i.toString() + ']'))
        //     u0_registers.push(out)
        //     expect(out).toEqual(expected_u0_registers[i])
        // }
        // expect(bigint_to_array(64, 4, BigInt('8386638881075453792406600069412283052291822895580742641789327979312054938465'))).toEqual(u0_registers)
        // // u1
        // const u1_registers: bigint[] = []
        // for (let i = 0; i < 4; i++) {
        //     const out = BigInt(await getSignalByName(circuit, witness, 'main.u[1][' + i.toString() + ']'))
        //     u1_registers.push(out)
        //     expect(out).toEqual(expected_u1_registers[i])
        // }
        // expect(bigint_to_array(64, 4, BigInt('40071583224459737250239606232440854032076176808341187421679277989916398099968'))).toEqual(u1_registers)
    })

    // const p = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F')
    // it('BytesToRegisters (all bytes are 255)', async () => {
    //     const circuit = 'bytes_to_registers_test'
    //     const bytes: number[] = []
    //     for (let i = 0; i < 48; i++) {
    //         bytes.push(255)
    //     }

    //     const expected_registers = bigint_to_array(
    //         64,
    //         4,
    //         BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') % p
    //     )
    //     const circuitInputs = stringifyBigInts({ bytes })
    //     const witness = await genWitness(circuit, circuitInputs)
    //     for (let i = 0; i < 4; i++) {
    //         const out = BigInt(await getSignalByName(circuit, witness, 'main.out[' + i.toString() + ']'))
    //         expect(out).toEqual(expected_registers[i])
    //     }
    // })

    // it('BytesToRegisters (for u0)', async () => {
    //     const circuit = 'bytes_to_registers_test'
    //     const circuitInputs = stringifyBigInts({ bytes: u0_bytes })
    //     const witness = await genWitness(circuit, circuitInputs)
    //     const registers: bigint[] = []
    //     for (let i = 0; i < 4; i++) {
    //         const out = BigInt(await getSignalByName(circuit, witness, 'main.out[' + i.toString() + ']'))
    //         expect(out.toString()).toEqual(expected_u0_registers[i].toString())
    //     }
    // })
})

