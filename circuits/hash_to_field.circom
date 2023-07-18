pragma circom 2.0.0;
include "./constants.circom";
include "./expand_message_xmd.circom";

template HashToField(msg_length) {
    signal input msg[msg_length];
    signal output u[2];

    component expand_message_xmd = ExpandMessageXmd(msg_length);
    for (var i = 0; i < msg_length; i ++) {
        expand_message_xmd.msg[i] <== msg[i];
    }

    component u0_bytes_to_field = BytesToField();
    component u1_bytes_to_field = BytesToField();

    for (var i = 0; i < 48; i ++) {
        u0_bytes_to_field.bytes[i] <== expand_message_xmd.out[i];
        u1_bytes_to_field.bytes[i] <== expand_message_xmd.out[i + 48];
    }

    u[0] <== u0_bytes_to_field.out;
    u[1] <== u1_bytes_to_field.out;

    // for (var i = 0; i < 4; i ++) {
    //     u[0][i] <== u0_bytes_to_registers.out[i];
    //     u[1][i] <== u1_bytes_to_registers.out[i];
    // }
}

// Converts a 48-byte array into a field value.
template BytesToField() {
    signal input bytes[48];
    signal output out;

    signal sum[49];
    sum[0] <== 0;
    for (var i = 0; i < 48; i ++) {
        sum[i + 1] <== sum[i] + (1<<(8*i))*bytes[47-i];
    }
    out <== sum[48];

    // Split each byte in bytes into bits
    // component n2b[48];
    // for (var i = 0; i < 6; i ++) {
    //     for (var j = 0 ; j < 8; j ++) {
    //         var idx = i * 8 + j;
    //         n2b[idx] = Num2Bits(8);
    //         n2b[idx].in <== bytes[idx];
    //     }
    // }

    // // Convert each chunk of 64 bits into a register
    // component b2n[6];
    // for (var i = 0; i < 6; i ++) {
    //     b2n[i] = Bits2Num(64);
    //     for (var j = 0; j < 8; j ++) {
    //         for (var k = 0; k < 8; k ++) {
    //             b2n[i].in[(7-j) * 8 + k] <== n2b[i * 8 + j].out[k];
    //         }
    //     }
    // }

    // // Input the registers into BigMod
    // component m = BigMod(64, 4);
    // for (var i = 0; i < 6; i ++) {
    //     m.a[i] <== b2n[5 - i].out;
    // }
    // for (var i = 6; i < 8; i ++) {
    //     m.a[i] <== 0;
    // }

    // var p[4] = get_secp256k1_p();
    // for (var i = 0; i < 4; i ++) {
    //     m.b[i] <== p[i];
    // }

    // for (var i = 0; i < 4; i ++) {
    //     out[i] <== m.mod[i];
    // }
}
