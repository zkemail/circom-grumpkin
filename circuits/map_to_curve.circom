pragma circom 2.0.0;

include "./constants.circom";
// include "./arith.circom";
// include "./iso_map.circom";
// include "../node_modules/circom-ecdsa/circuits/bigint.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template CMov() {
    // The spec says "CMOV(a, b, c): If c is False, CMOV returns a, otherwise
    // it returns b."

    // As such, if c is 0, output a. Otherwise, output b. 
    signal input a;
    signal input b;
    signal input c;
    signal output out;
    
    component mux = Mux1();
    mux.c[0] <== a;
    mux.c[1] <== b;
    mux.s <== c;
    out <== mux.out;

    // component mux[4];
    // for (var i = 0; i < 4; i ++) {
    //     mux[i] = Mux1();
    //     mux[i].c[0] <== a[i];
    //     mux[i].c[1] <== b[i];
    //     mux[i].s <== c;
    // }

    // for (var i = 0; i < 4; i ++) {
    //     out[i] <== mux[i].out;
    // }
}

template Inv0() {
    signal input in;
    signal output out;

    signal inv;
    inv <-- in!=0 ? 1/in : 0;
    signal is_zero <== -in * inv + 1;
    in*is_zero === 0;
    out <== (1-is_zero) * inv;

    // var p[4] = get_secp256k1_p();
    // component modinv = BigModInv(64, 4);
    // for (var i = 0; i < 4; i ++) {
    //     modinv.in[i] <== a[i];
    //     modinv.p[i] <== p[i];
    // }

    // for (var i = 0; i < 4; i ++) {
    //     out[i] <== modinv.out[i];
    // }
}

// template ZMulUSquared() {
//     signal input u_squared[4];
//     signal output out[4];
//     var z[4] = get_Z();

//     component mul = Multiply();
//     for (var i = 0; i < 4; i ++) {
//         mul.a[i] <== u_squared[i];
//         mul.b[i] <== z[i];
//     }

//     for (var i = 0; i < 4; i ++) {
//         out[i] <== mul.out[i];
//     }
// }

// template IsEqualBigInt() {
//     signal input a[4];
//     signal input b[4];
//     signal output out;

//     component is_eq[4];
//     signal sum[5];
//     sum[0] <== 0;
//     for (var i = 0; i < 4; i ++) {
//         is_eq[i] = IsEqual();
//         is_eq[i].in[0] <== a[i];
//         is_eq[i].in[1] <== b[i];
//         sum[i + 1] <== sum[i] + is_eq[i].out;
//     }
//     component result = IsEqual();
//     result.in[0] <== sum[4];
//     result.in[1] <== 4;
//     out <== result.out;
// }

// Output 0 if the input is even, and 1 if it is odd
template Sgn0() {
    signal input in;
    signal output out;

    // Only need to test the 0th bigint register
    signal val;
    val <== in;

    signal r <-- val % 2;
    signal q <-- val \ 2;

    // Ensure that r is 0 xor 1
    r * (r - 1) === 0;

    // Ensure that q * 2 + r equals the input
    q * 2 + r === val;

    component num2bits = Num2Bits(254);
    num2bits.in <== in;
    r === num2bits.out[0];

    // If the remainder is 0, output 0; if it is 1, output 1
    out <== r;
}

template IsSqrt() {
    signal input in;
    signal output out;

    var power_bits[253] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1];

    signal acc[254];
    acc[0] <== 1;
    signal squared[254];
    squared[0] <== in;
    for(var i=0; i<253; i++) {
        if(power_bits[i]==1) {
            acc[i+1] <== acc[i] * squared[i];
        } else {
            acc[i+1] <== acc[i];
        }
        squared[i+1] <== squared[i] * squared[i];
    }
    component is_equal = IsEqual();
    is_equal.in[0] <== acc[253];
    is_equal.in[1] <== 1;
    out <== is_equal.out;
}

// template XY2Selector() {
//     // Either gx1 or gx2 are square.
//     signal input gx1[4];
//     signal input gx1_sqrt[4];
//     signal input gx2[4];
//     signal input gx2_sqrt[4];
//     signal input x1[4];
//     signal input x2[4];
//     signal output x[4];
//     signal output y2[4];

//     // Step 1: square gx1_sqrt
//     component sq_gx1_sqrt = Square();
//     for (var i = 0; i < 4; i ++) {
//         sq_gx1_sqrt.in[i] <== gx1_sqrt[i];
//     }

//     // Step 2: square gx2_sqrt
//     component sq_gx2_sqrt = Square();
//     for (var i = 0; i < 4; i ++) {
//         sq_gx2_sqrt.in[i] <== gx2_sqrt[i];
//     }

//     // Step 3: s1 = IsEqual(gx1, sq_gx1_sqrt)
//     component s1 = IsEqualBigInt();
//     for (var i = 0; i < 4; i ++) {
//         s1.a[i] <== gx1[i];
//         s1.b[i] <== sq_gx1_sqrt.out[i];
//     }

//     // Step 4: s2 = IsEqual(gx2, sq_gx2_sqrt)
//     component s2 = IsEqualBigInt();
//     for (var i = 0; i < 4; i ++) {
//         s2.a[i] <== gx2[i];
//         s2.b[i] <== sq_gx2_sqrt.out[i];
//     }

//     // Step 5: Constrain s1 + s2 === 1
//     s1.out + s2.out === 1;

//     // Step 6: x <== s1 == 1 ? x1 : x2
//     component x_cmov = CMov();
//     x_cmov.c <== s1.out;
//     for (var i = 0; i < 4; i ++) {
//         x_cmov.a[i] <== x2[i];
//         x_cmov.b[i] <== x1[i];
//     }

//     // Step 7: y2 <== s1 == 1 ? gx1 : gx2
//     component y2_cmov = CMov();
//     y2_cmov.c <== s1.out;
//     for (var i = 0; i < 4; i ++) {
//         y2_cmov.a[i] <== gx2[i];
//         y2_cmov.b[i] <== gx1[i];
//     }

//     for (var i = 0; i < 4; i ++) {
//         x[i] <== x_cmov.out[i];
//         y2[i] <== y2_cmov.out[i];
//     }
// }

/**
 * Original: Copyright (c) 2019, ABDK Consulting, https://github.com/abdk-consulting/abdk-libraries-circom/blob/master/base/utils/min.circom
 * Calculate minimum of two signals.
 *
 * @param x first signal
 * @param y second signal
 * @return minimum of two signals
 */
function min (x, y) {
  return x < y ? x : y;
}

/**
 * Original: Copyright (c) 2019, ABDK Consulting, https://github.com/abdk-consulting/abdk-libraries-circom/blob/master/base/field/FieldSqrt.circom
 * Calculate square root of given field element.
 *
 * @input x field element to calculate square root of
 * @output result square root of x
 */
template FieldSqrt () {
  signal input x;
  signal output result;

  assert(x == 0 || x**(-1 / 2) == 1);

  if (x == 0 || x != 0) { // Prevent calculation at compile time
    var q = -1;
    var s = 0;

    while (q % 2 == 0) {
      q = q >> 1;
      s = s + 1;
    }

    assert(-1 == q * 2**s);

    var z = 1;
    while (z**(-1 / 2) == 1) z += 1;

    var m = s;
    var c = z**q;
    var t = x**q;
    var r = x**((q + 1) / 2);
    var i;
    var b;

    while (t != 0 && t != 1) {
      i = 1;
      while (t**(1 << i) != 1) i += 1;

      b = c**(2**(m - i - 1));
      m = i;
      c = b**2;
      t = t * b**2;
      r = r * b;
    }

    
    result <-- t == 0 ? 0 : min(r,-r);
  }

  result * result === x;
}

template MapToCurve() {
    signal input u;
    // signal input gx1_sqrt;
    // signal input gx2_sqrt;
    // signal input y_pos;
    // signal input x_mapped;
    // signal input y_mapped;
    signal output x;
    signal output y;

    // parameters
    var a = 0;
    var b = -17;
    var z = 1;
    var c1 = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593effffff1;
    var c2 = 0x183227397098d014dc2822db40c0ac2e9419f4243cdcb848a1f0fac9f8000000;
    var c3 = 0x0000000000000002cf135e7506a45d66a7931f8d66dae274453478a4c627115c;
    var c4 = 0x2042def740cbc01bd03583cf0100e59370229adafbd0f5b62d414e62a0000016;

    // 1. tv1 = u^2
    signal step1_tv1 <== u * u;
    // 2. tv1 = tv1 * c1
    signal step2_tv1 <== step1_tv1 * c1;
    // 3. tv2 = 1 + tv1;
    signal step3_tv2 <== 1 + step2_tv1;
    // 4. tv1 = 1 - tv1;
    signal step4_tv1 <== 1 - step2_tv1;
    // 5. tv3 = tv1 * tv2
    signal step5_tv3 <== step4_tv1 * step3_tv2;
    // 6. tv3 = inv0(tv3)
    component step6_tv3 = Inv0();
    step6_tv3.in <== step5_tv3;
    // 7. tv4 = u * tv1
    signal step_7_tv4 <== u * step4_tv1;
    // 8. tv4 = tv4 * tv3
    signal step8_tv4 <== step_7_tv4 * step6_tv3.out;
    // 9. tv4 = tv4 * c3
    signal step9_tv4 <== step8_tv4 * c3;
    // 10. x1 = c2 - tv4
    signal step10_x1 <== c2 - step9_tv4;
    // 11. gx1 = x1^2
    signal step11_gx1 <== step10_x1 * step10_x1;
    // 12. gx1 = gx1 + A
    signal step12_gx1 <== step11_gx1 + a;
    // 13. gx1 = gx1 * x1
    signal step13_gx1 <== step12_gx1 * step10_x1;
    // 14. gx1 = gx1 + B
    signal step14_gx1 <== step13_gx1 + b;
    // 15. e1 = is_square(gx1)
    component step15_e1 = IsSqrt();
    step15_e1.in <== step14_gx1;
    // 16. x2 = c2 + tv4
    signal step16_x2 <== c2 + step9_tv4;
    // 17. gx2 = x2^2
    signal step17_gx2 <== step16_x2 * step16_x2;
    // 18. gx2 = gx2 + A
    signal step18_gx2 <== step17_gx2 + a;
    // 19. gx2 = gx2 * x2
    signal step19_gx2 <== step18_gx2 * step16_x2;
    // 20. gx2 = gx2 + B
    signal step20_gx2 <== step19_gx2 + b;
    // 21. e2 = is_square(gx2) AND NOT e1    # Avoid short-circuit logic ops
    component step21_gx2_square = IsSqrt();
    step21_gx2_square.in <== step20_gx2;
    signal step21_e2 <== step21_gx2_square.out * (1-step15_e1.out);
    // 22. x3 = tv2^2
    signal step22_x3 <== step3_tv2 * step3_tv2;
    // 23. x3 = x3 * tv3
    signal step23_x3 <== step22_x3 * step6_tv3.out;
    // 24. x3 = x3^2
    signal step24_x3 <== step23_x3 * step23_x3;
    // 25. x3 = x3 * c4
    signal step25_x3 <== step24_x3 * c4;
    // 26. x3 = x3 + Z
    signal step26_x3 <== step25_x3 + z;
    // 27. x = CMOV(x3, x1, e1)    # x = x1 if gx1 is square, else x = x3
    component step27_x = CMov();
    step27_x.a <== step26_x3;
    step27_x.b <== step10_x1;
    step27_x.c <== step15_e1.out;
    // 28. x = CMOV(x, x2, e2)    # x = x2 if gx2 is square and gx1 is not
    component step28_x = CMov();
    step28_x.a <== step27_x.out;
    step28_x.b <== step16_x2;
    step28_x.c <== step21_e2;
    // 29. gx = x^2
    signal step29_gx <== step28_x.out * step28_x.out;
    // 30. gx = gx + A
    signal step30_gx <== step29_gx + a;
    // 31. gx = gx * x
    signal step31_gx <== step30_gx * step28_x.out;
    // 32. gx = gx + B
    signal step32_gx <== step31_gx + b;
    // 33. y = sqrt(gx)
    component step33_y = FieldSqrt();
    step33_y.x <== step32_gx;
    // 34. e3 = sgn0(u) == sgn0(y)
    component step34_e3 = IsEqual();
    component sgn0_u = Sgn0();
    sgn0_u.in <== u;
    component sgn0_y = Sgn0();
    sgn0_y.in <== step33_y.result;
    step34_e3.in[0] <== sgn0_u.out;
    step34_e3.in[1] <== sgn0_y.out;
    // 35. y = CMOV(-y, y, e3)    # Select correct sign of y
    component step35_y = CMov();
    step35_y.a <== -step33_y.result;
    step35_y.b <== step33_y.result;
    step35_y.c <== step34_e3.out;
    x <== step28_x.out;
    y <== step35_y.out;
}

// template MapToCurve() {
//     signal input u[4];
//     signal input gx1_sqrt[4];
//     signal input gx2_sqrt[4];
//     signal input y_pos[4];
//     signal input x_mapped[4];
//     signal input y_mapped[4];
//     signal output x[4];
//     signal output y[4];

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 1: tv1 = Z * u^2
//     component step1_u_sq = Square();
//     for (var i = 0; i < 4; i ++) {
//         step1_u_sq.in[i] <== u[i];
//     }
//     component step1_tv1 = ZMulUSquared();
//     for (var i = 0; i < 4; i ++) {
//         step1_tv1.u_squared[i] <== step1_u_sq.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 2: tv2 = tv1^2
//     component step2_tv2 = Square();
//     for (var i = 0; i < 4; i ++) {
//         step2_tv2.in[i] <== step1_tv1.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 3: x1 = tv1 + tv2
//     component step3_tv1_plus_tv2 = Add();
//     for (var i = 0; i < 4; i ++) {
//         step3_tv1_plus_tv2.a[i] <== step1_tv1.out[i];
//         step3_tv1_plus_tv2.b[i] <== step2_tv2.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 4: x1 = inv0(x1)
//     component step4_inv0_x1 = Inv0();
//     for (var i = 0; i < 4; i ++) {
//         step4_inv0_x1.a[i] <== step3_tv1_plus_tv2.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 5: e1 = x1 == 0
//     component step5_is_zeroes[4];
//     for (var i = 0; i < 4; i ++) {
//         step5_is_zeroes[i] = IsZero();
//         step5_is_zeroes[i].in <== step4_inv0_x1.out[i];
//     }
//     component step5_e1 = IsEqual();
//     step5_e1.in[0] <== 
//         step5_is_zeroes[0].out +
//         step5_is_zeroes[1].out +
//         step5_is_zeroes[2].out +
//         step5_is_zeroes[3].out;
//     step5_e1.in[1] <== 4;

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 6: x1 = x1 + 1
//     component step6_x1_plus_1 = Add();
//     for (var i = 0; i < 4; i ++) {
//         step6_x1_plus_1.a[i] <== step4_inv0_x1.out[i];
//     }
//     step6_x1_plus_1.b[0] <== 1;
//     step6_x1_plus_1.b[1] <== 0;
//     step6_x1_plus_1.b[2] <== 0;
//     step6_x1_plus_1.b[3] <== 0;

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 7: x1 = CMOV(x1, c2, e1)    # If (tv1 + tv2) == 0, set x1 = -1 / Z
//     var c2[4] = get_C2();
//     component step7_cmov = CMov();
//     step7_cmov.c <== step5_e1.out;
//     for (var i = 0; i < 4; i ++) {
//         step7_cmov.a[i] <== step6_x1_plus_1.out[i];
//         step7_cmov.b[i] <== c2[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 8: x1 = x1 * c1      # x1 = (-B / A) * (1 + (1 / (Z^2 * u^4 + Z * u^2)))
//     component step8_x1_mul_c1 = Multiply();
//     var c1[4] = get_C1();
//     for (var i = 0; i < 4; i ++) {
//         step8_x1_mul_c1.a[i] <== step7_cmov.out[i];
//         step8_x1_mul_c1.b[i] <== c1[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 9: gx1 = x1^2
//     component step9_gx1 = Square();
//     for (var i = 0; i < 4; i ++) {
//         step9_gx1.in[i] <== step8_x1_mul_c1.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 10: gx1 = gx1 + A
//     var a[4] = get_A();
//     component step10_gx1 = Add();
//     for (var i = 0; i < 4; i ++) {
//         step10_gx1.a[i] <== step9_gx1.out[i];
//         step10_gx1.b[i] <== a[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 11: gx1 = gx1 * x1
//     component step11_gx1_mul_x1 = Multiply();
//     for (var i = 0; i < 4; i ++) {
//         step11_gx1_mul_x1.a[i] <== step10_gx1.out[i];
//         step11_gx1_mul_x1.b[i] <== step8_x1_mul_c1.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 12: gx1 = gx1 + B             # gx1 = g(x1) = x1^3 + A * x1 + B
//     var b[4] = get_B();
//     component step12_gx1 = Add();
//     for (var i = 0; i < 4; i ++) {
//         step12_gx1.a[i] <== step11_gx1_mul_x1.out[i];
//         step12_gx1.b[i] <== b[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 13: x2 = tv1 * x1            # x2 = Z * u^2 * x1
//     component step13_x2 = Multiply();
//     for (var i = 0; i < 4; i ++) {
//         step13_x2.a[i] <== step1_tv1.out[i];
//         step13_x2.b[i] <== step8_x1_mul_c1.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 14: tv2 = tv1 * tv2
//     component step14_tv2 = Multiply();
//     for (var i = 0; i < 4; i ++) {
//         step14_tv2.a[i] <== step1_tv1.out[i];
//         step14_tv2.b[i] <== step2_tv2.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 15: gx2 = gx1 * tv2           # gx2 = (Z * u^2)^3 * gx1
//     component step15_gx2 = Multiply();
//     for (var i = 0; i < 4; i ++) {
//         step15_gx2.a[i] <== step12_gx1.out[i];
//         step15_gx2.b[i] <== step14_tv2.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Steps 16-18:
//     //     e2 = is_square(gx1)
//     //     x = CMOV(x2, x1, e2)    # If is_square(gx1), x = x1, else x = x2
//     //     y2 = CMOV(gx2, gx1, e2)  # If is_square(gx1), y2 = gx1, else y2 = gx2
//     component step16_x_y2_selector = XY2Selector();
//     for (var i = 0; i < 4; i ++) {
//         step16_x_y2_selector.gx1[i] <== step12_gx1.out[i];
//         step16_x_y2_selector.gx1_sqrt[i] <== gx1_sqrt[i];
//         step16_x_y2_selector.gx2[i] <== step15_gx2.out[i];
//         step16_x_y2_selector.gx2_sqrt[i] <== gx2_sqrt[i];
//         step16_x_y2_selector.x1[i] <== step8_x1_mul_c1.out[i];
//         step16_x_y2_selector.x2[i] <== step13_x2.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 19: y = sqrt(y2)
//     component step19_expected_y2 = Square();
//     for (var i = 0; i < 4; i ++) {
//         step19_expected_y2.in[i] <== y_pos[i];
//     }
//     // Ensure that the square of the input signal y equals step16_x_y2_selector.y2
//     for (var i = 0; i < 4; i ++) {
//         step16_x_y2_selector.y2[i] === step19_expected_y2.out[i];
//     }

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 20: e3 = sgn0(u) == sgn0(y)  # Fix sign of y
//     component sgn0_u = Sgn0();
//     component sgn0_y = Sgn0();
//     for (var i = 0; i < 4; i ++) {
//         sgn0_u.in[i] <== u[i];
//         sgn0_y.in[i] <== y_pos[i];
//     }
//     component step20_e3 = IsEqual();
//     step20_e3.in[0] <== sgn0_u.out;
//     step20_e3.in[1] <== sgn0_y.out;

//     ///////////////////////////////////////////////////////////////////////////
//     // Step 21: y = CMOV(-y, y, e3)
//     component neg_y = Negate();
//     for (var i = 0; i < 4; i ++) {
//         neg_y.in[i] <== y_pos[i];
//     }

//     component step21_y = CMov();
//     step21_y.c <== step20_e3.out;
//     for (var i = 0; i < 4; i ++) {
//         step21_y.a[i] <== neg_y.out[i];
//         step21_y.b[i] <== y_pos[i];
//     }

//     component isomap = IsoMap();
//     for (var i = 0; i < 4; i ++) {
//         isomap.x[i] <== step16_x_y2_selector.x[i];
//         isomap.y[i] <== step21_y.out[i];
//         isomap.x_mapped[i] <== x_mapped[i];
//         isomap.y_mapped[i] <== y_mapped[i];
//     }

//     for (var i = 0; i < 4; i ++) {
//         x[i] <== x_mapped[i];
//         y[i] <== y_mapped[i];
//     }
// }
