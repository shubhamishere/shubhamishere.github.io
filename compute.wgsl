// This buffer will receive the data computed by the shader.
// 'var<storage, read_write>' means it's a buffer we can both read from and write to in the shader.
// '@group(0) @binding(0)' specifies how this buffer is connected to the JavaScript code.
@group(0) @binding(0) var<storage, read_write> outputBuffer : array<u32>;

// The '@compute' attribute marks this function as the entry point for a compute shader.
// '@workgroup_size(64)' specifies that each workgroup will contain 64 threads (invocations).
// We'll dispatch enough workgroups to cover all the elements we want to process.
@compute @workgroup_size(64) // Using 64 threads per workgroup is common
fn main(
    // '@builtin(global_invocation_id)' provides the unique ID for this specific thread
    // across the entire dispatch call. It's a 3D vector (x, y, z).
    @builtin(global_invocation_id) global_id : vec3<u32>
    ) {

    // Get the size of the output buffer (number of elements).
    let num_elements = arrayLength(&outputBuffer);

    // Calculate a linear index from the 3D global_id.
    // For a 1D dispatch (like we'll do), we only need the x component.
    let index = global_id.x;

    // Safety check: Only write to the buffer if the current thread's index is within bounds.
    // This prevents out-of-bounds writes if we dispatch more threads than buffer elements.
    if (index < num_elements) {
        // Write the thread's own global index into the corresponding position in the output buffer.
        outputBuffer[index] = index+1;
    }
}