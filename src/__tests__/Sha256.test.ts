jest.setTimeout(360000)
const crypto = require('crypto')
const ff = require('ffjavascript')
const stringifyBigInts = ff.utils.stringifyBigInts
// import {
//     callGenWitness as genWitness,
//     callGetSignalByName as getSignalByName,
// } from 'circom-helper'
import {
    strToPaddedBytes,
    buffer2bitArray,
    strToSha256PaddedBitArr,
    bufToSha256PaddedBitArr,
    msgToSha256PaddedBitArr,
} from '../utils'
import {
    str_to_array,
    gen_msg_prime,
} from '../generate_inputs'
import * as path from "path";
const circom_tester = require("circom_tester");
const wasm_tester = circom_tester.wasm;

describe('Sha256', () => {
    it('checkZeroPad_test (valid)', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/checkZeroPad_test.circom"))
        const circuitInputs = stringifyBigInts({
            in: [0, 2, 0, 0, 5],
            start: 2,
            end: 4,
        })
        const witness = await circuit.calculateWitness(circuitInputs)
        await circuit.checkConstraints(witness);
    })

    it('checkZeroPad_test (invalid)', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/checkZeroPad_test.circom"))
        try {
            const circuitInputs = stringifyBigInts({
                in: [0, 2, 1, 0, 5],
                start: 2,
                end: 4,
            })
            const witness = await circuit.calculateWitness(circuitInputs)
            await circuit.checkConstraints(witness);
            expect(false).toBeTruthy()
        } catch (e) {
            expect(true).toBeTruthy()
        }

        try {
            const circuitInputs = stringifyBigInts({
                in: [0, 2, 0, 1, 0],
                start: 2,
                end: 4,
            })
            const witness = await circuit.calculateWitness(circuitInputs)
            await circuit.checkConstraints(witness);
            expect(false).toBeTruthy()
        } catch (e) {
            expect(true).toBeTruthy()
        }

        expect.assertions(2)
    })

    it('startsWith_test (valid)', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/startsWith_test.circom"))
        const circuitInputs = stringifyBigInts({
            a: [1, 2, 3, 0, 0],
            b: [1, 2, 3, 4, 0],
            num_elements: 3,
        })
        const witness = await circuit.calculateWitness(circuitInputs)
        await circuit.checkConstraints(witness);
    })

    it('startsWith_test (invalid)', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/startsWith_test.circom"))
        const circuitInputs = stringifyBigInts({
            a: [1, 2, 3, 0, 0],
            b: [1, 2, 0, 4, 5],
            num_elements: 3,
        })
        try {
            const witness = await circuit.calculateWitness(circuitInputs)
            await circuit.checkConstraints(witness);
            expect(false).toBeTruthy()
        } catch (e) {
            expect(true).toBeTruthy()
        }

        expect.assertions(1)
    })

    it('verifyPaddedBits_test', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/verifyPaddedBits_test.circom"))
        const msg = 'abc'
        const padded_bits = strToSha256PaddedBitArr(msg)
        const circuitInputs = stringifyBigInts({
            padded_bits: padded_bits.split(''),
            msg: msgToSha256PaddedBitArr(msg).split(''),
        })
        const witness = await circuit.calculateWitness(circuitInputs)
        await circuit.checkConstraints(witness);
    })

    it('Sha256Raw circuit', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/sha256raw_test.circom"))
        const msg = 'abc'
        const padded_bits = strToSha256PaddedBitArr(msg)
        const circuitInputs = stringifyBigInts({
            padded_bits: padded_bits.split(''),
        })
        const witness = await circuit.calculateWitness(circuitInputs)
        await circuit.checkConstraints(witness);
        let outBits = ''
        for (let i = 0; i < 256; i++) {
            //const out = BigInt(await getSignalByName(circuit, witness, 'main.out[' + i.toString() + ']'))
            const out = BigInt(witness[i + 1])
            outBits += out
        }

        const hash = crypto.createHash("sha256")
            .update(Buffer.from(msg))
            .digest('hex')

        expect(BigInt('0b' + outBits).toString(16)).toEqual(hash)
    })

    it('Sha256Hash circuit', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/sha256Hash_test.circom"))
        const msg = 'abc'
        const paddedIn = strToSha256PaddedBitArr(msg)
        const circuitInputs = stringifyBigInts({
            padded_bits: paddedIn.split(''),
            msg: msgToSha256PaddedBitArr(msg).split(''),
        })
        const witness = await circuit.calculateWitness(circuitInputs)
        await circuit.checkConstraints(witness);
        let outBits = ''
        for (let i = 0; i < 256; i++) {
            //const out = BigInt(await getSignalByName(circuit, witness, 'main.out[' + i.toString() + ']'))
            const out = BigInt(witness[i + 1])
            outBits += out
        }

        const hash = crypto.createHash("sha256")
            .update(Buffer.from(msg))
            .digest('hex')

        expect(BigInt('0b' + outBits).toString(16)).toEqual(hash)
    })
})
