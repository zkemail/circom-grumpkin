import * as crypto from 'crypto'
const assert = require('assert')
import {
    dst_prime,
    z_pad,
    lib_str,
    p,
    Z,
    c1,
    c2,
    c3,
    c4,
    A,
    B,
} from './constants'
const ff = require('ffjavascript')
import { sgn0, mod } from './utils'
// import { iso_map } from './iso_map'
// import { Point } from '@noble/secp256k1';

const str_to_array = (msg: string): number[] => {
    return msg.split('').map((x) => Buffer.from(x)[0])
}

const buf_to_array = (buf: Buffer): number[] => {
    const r: number[] = []
    for (let i = 0; i < buf.length; i++) {
        r.push(Number(buf[i]))
    }

    return r
}

const strxor = (a: number[], b: number[]): number[] => {
    const result: number[] = []
    for (let i = 0; i < a.length; i++) {
        result.push(a[i] ^ b[i])
    }
    return result
}

const gen_msg_prime = (msg_array: number[]): any => {
    return z_pad.concat(msg_array).concat(lib_str).concat([0]).concat(dst_prime)
}

const gen_b0 = (msg_prime: number[]) => {
    const buff = Buffer.from(msg_prime)
    const hash = crypto.createHash("sha256").update(buff).digest()
    return buf_to_array(hash)
}

const gen_b1 = (b0: number[]) => {
    const buff = Buffer.from(b0.concat([1]).concat(dst_prime))
    const hash = crypto.createHash("sha256").update(buff).digest()
    return buf_to_array(hash)
}

const gen_b2 = (b0: number[], b1: number[]) => {
    const buff = Buffer.from(strxor(b0, b1).concat([2]).concat(dst_prime))
    const hash = crypto.createHash("sha256").update(buff).digest()
    return buf_to_array(hash)
}

const gen_b3 = (b0: number[], b2: number[]) => {
    const buff = Buffer.from(strxor(b0, b2).concat([3]).concat(dst_prime))
    const hash = crypto.createHash("sha256").update(buff).digest()
    return buf_to_array(hash)
}

const expand_msg_xmd = (msg_array: number[]): any => {
    const msg_prime = gen_msg_prime(msg_array)
    const b0 = gen_b0(msg_prime)
    const b1 = gen_b1(b0)
    const b2 = gen_b2(b0, b1)
    const b3 = gen_b3(b0, b2)
    return b1.concat(b2).concat(b3)
}

const field = new ff.F1Field(p)


const hash_to_field = (msg_array: number[]) => {
    const uniform_bytes = expand_msg_xmd(msg_array)

    const u0_bytes = uniform_bytes.slice(0, 48)
    const u1_bytes = uniform_bytes.slice(48)

    const u0 = ff.utils.beBuff2int(Buffer.from(u0_bytes)) % p
    const u1 = ff.utils.beBuff2int(Buffer.from(u1_bytes)) % p
    return [u0, u1]

}

const map_to_curve = (u: bigint) => {
    // 1. tv1 = u^2
    let tv1 = mod((u * u), p);
    // 2. tv1 = tv1 * c1
    tv1 = mod((tv1 * c1), p);
    // 3. tv2 = 1 + tv1
    let tv2 = mod((tv1 + BigInt(1)), p);
    // 4. tv1 = 1 - tv1
    // console.log((BigInt(1) - tv1) % p);
    tv1 = mod((BigInt(1) - tv1), p);
    // 5. tv3 = tv1 * tv2
    let tv3 = mod((tv1 * tv2), p);
    // 6. tv3 = inv0(tv3)
    tv3 = field.inv(tv3);
    // 7. tv4 = u * tv1
    let tv4 = mod((u * tv1), p);
    // 8. tv4 = tv4 * tv3
    tv4 = mod((tv4 * tv3), p);
    // 9. tv4 = tv4 * c3
    tv4 = mod((tv4 * c3), p);
    // 10. x1 = c2 - tv4
    let x1 = mod((c2 - tv4), p);
    // 11. gx1 = x1^2
    let gx1 = mod((x1 * x1), p);
    // 12. gx1 = gx1 + A
    gx1 = mod((gx1 + A), p);
    // 13. gx1 = gx1 * x1
    gx1 = mod((gx1 * x1), p);
    // 14. gx1 = gx1 + B
    gx1 = mod((gx1 + B), p);
    // 15. e1 = is_square(gx1)
    let e1 = field.sqrt(gx1) != null;
    // 16. x2 = c2 + tv4
    let x2 = mod((c2 + tv4), p);
    // 17. gx2 = x2^2
    let gx2 = mod((x2 * x2), p);
    // 18. gx2 = gx2 + A
    gx2 = mod((gx2 + A), p);
    // 19. gx2 = gx2 * x2
    gx2 = mod((gx2 * x2), p);
    // 20. gx2 = gx2 + B
    gx2 = mod((gx2 + B), p);
    // 21. e2 = is_square(gx2) AND NOT e1    # Avoid short-circuit logic ops
    let e2 = field.sqrt(gx2) != null && !e1;
    // 22. x3 = tv2^2
    let x3 = mod((tv2 * tv2), p);
    // 23. x3 = x3 * tv3
    x3 = mod((x3 * tv3), p);
    // 24. x3 = x3^2
    x3 = mod((x3 * x3), p);
    // 25. x3 = x3 * c4
    x3 = mod((x3 * c4), p);
    // 26. x3 = x3 + Z
    x3 = mod((x3 + Z), p);
    // 27. x = CMOV(x3, x1, e1)    # x = x1 if gx1 is square, else x = x3
    let x = e1 ? x1 : x3;
    // 28. x = CMOV(x, x2, e2)    # x = x2 if gx2 is square and gx1 is not
    x = e2 ? x2 : x;
    // 29. gx = x^2
    let gx = mod((x * x), p);
    // 30. gx = gx + A
    gx = mod((gx + A), p);
    // 31. gx = gx * x
    gx = mod((gx * x), p);
    // 32. gx = gx + B
    gx = mod((gx + B), p);
    // 33. y = sqrt(gx)
    let y = field.sqrt(gx);
    // 34. e3 = sgn0(u) == sgn0(y)
    let e3 = sgn0(u) == sgn0(y);
    // 35. y = CMOV(-y, y, e3)    # Select correct sign of y
    y = e3 ? y : mod((p - y), p);

    return {
        x: x,
        y: y
    }
}

const point_add = (x0: bigint, y0: bigint, x1: bigint, y1: bigint) => {
    if (x0 == BigInt(0) && y0 == BigInt(1)) {
        return {
            x: x1,
            y: y1
        }
    }
    const x_sub = mod((x0 - x1), p);
    const x_sub_inv = field.inv(x_sub);
    const lambda = mod((y0 - y1) * x_sub_inv, p);
    const x2 = mod((lambda * lambda - x0 - x1), p);
    const cross = mod((y1 * x0 - y0 * x1), p);
    const gamma = mod((cross * x_sub_inv), p);
    const y2 = mod((- lambda * x2 - gamma), p);
    return { x: x2, y: y2 }
}

const point_double = (x0: bigint, y0: bigint) => {
    const y2_inv = field.inv(BigInt(2) * y0);
    const lambda = mod((BigInt(3) * x0 * x0) * y2_inv, p);
    const x2 = mod((lambda * lambda - BigInt(2) * x0), p);
    const gamma = mod((y0 - lambda * x0), p);
    const y2 = mod((- lambda * x2 - gamma), p);
    return { x: x2, y: y2 }
}

const point_scalar_mul = (x0: bigint, y0: bigint, scalar: bigint) => {
    let doubled = { x: x0, y: y0 };
    let result = { x: BigInt(0), y: BigInt(1) };
    for (let i = 0; i < 254; i++) {
        if (((scalar >> BigInt(i)) & BigInt(1)) === BigInt(1)) {
            result = point_add(result.x, result.y, doubled.x, doubled.y);
        }
        doubled = point_double(doubled.x, doubled.y);
    }
    return result;
}

const hash_to_curve = (msg: number[]) => {
    const us = hash_to_field(msg);
    const point0 = map_to_curve(us[0]);
    const point1 = map_to_curve(us[1]);
    return point_add(point0.x, point0.y, point1.x, point1.y);
}

// const generate_inputs = (msg: string): any => {
//     const msg_array = str_to_array(msg)
//     return generate_inputs_from_array(msg_array)
// }

// const generate_inputs_from_array = (msg: number[]): any => {
//     const uniform_bytes = expand_msg_xmd(msg)

//     const u0_bytes = uniform_bytes.slice(0, 48)
//     const u1_bytes = uniform_bytes.slice(48)

//     const u0 = ff.utils.beBuff2int(Buffer.from(u0_bytes)) % p
//     const u1 = ff.utils.beBuff2int(Buffer.from(u1_bytes)) % p

//     const q0 = map_to_curve(u0)
//     const q1 = map_to_curve(u1)

//     return {
//         msg: msg,
//         q0_gx1_sqrt: bigint_to_array(64, 4, q0.gx1_sqrt),
//         q0_gx2_sqrt: bigint_to_array(64, 4, q0.gx2_sqrt),
//         q0_y_pos: bigint_to_array(64, 4, q0.y_pos),
//         q1_gx1_sqrt: bigint_to_array(64, 4, q1.gx1_sqrt),
//         q1_gx2_sqrt: bigint_to_array(64, 4, q1.gx2_sqrt),
//         q1_y_pos: bigint_to_array(64, 4, q1.y_pos),
//         q0_x_mapped: bigint_to_array(64, 4, q0.x),
//         q0_y_mapped: bigint_to_array(64, 4, q0.y),
//         q1_x_mapped: bigint_to_array(64, 4, q1.x),
//         q1_y_mapped: bigint_to_array(64, 4, q1.y),
//     }

//     //const q0_mapped_pt = new Point(q0_mapped.x, q0_mapped.y)
//     //const q1_mapped_pt = new Point(q1_mapped.x, q1_mapped.y)

//     //const point = q0_mapped_pt.add(q1_mapped_pt)
//     //return point
// }

export {
    gen_msg_prime,
    gen_b0,
    gen_b1,
    gen_b2,
    gen_b3,
    // generate_inputs,
    // generate_inputs_from_array,
    strxor,
    str_to_array,
    expand_msg_xmd,
    // bytes_to_registers,
    sgn0,
    hash_to_field,
    map_to_curve,
    point_add,
    point_double,
    point_scalar_mul,
    hash_to_curve
}
