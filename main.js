async function main() {
    const outputElement = document.getElementById('output');
    outputElement.textContent = 'Requesting WebGPU adapter...';
    console.log("Requesting WebGPU adapter...");

    // 1. Check for WebGPU support and Request Adapter/Device
    if (!navigator.gpu) {
        outputElement.textContent = 'WebGPU not supported on this browser!';
        console.error("WebGPU not supported.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        outputElement.textContent = 'Failed to get GPU adapter.';
        console.error("Failed to get GPU adapter.");
        return;
    }
    outputElement.textContent = 'Got adapter. Requesting device...';
    console.log("Got adapter:", adapter);

    const device = await adapter.requestDevice();
    outputElement.textContent = 'Got device. Setting up buffers and pipeline...';
    console.log("Got device:", device);

    // 2. Define Data Size and Create Buffers
    const numElements = 256; // Let's calculate IDs for 256 threads
    const bufferSize = numElements * Uint32Array.BYTES_PER_ELEMENT; // Size in bytes

    // Create GPU buffer to store shader output
    // Usage: STORAGE (shader can write to it) | COPY_SRC (we can copy data FROM it)
    const outputBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

    // Create CPU-readable buffer to receive the data from the GPU
    // Usage: MAP_READ (we can read it on the CPU) | COPY_DST (we can copy data TO it)
    const stagingBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    // 3. Load and Compile Shader Code
    console.log("Loading shader code...");
    const shaderCode = await fetch('compute.wgsl').then(res => res.text());
    const shaderModule = device.createShaderModule({
        code: shaderCode
    });
    console.log("Shader module created.");

    // 4. Create Pipeline Layout and Bind Group Layout
    // Describes the resources (buffers, textures) the shader expects
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0, // Matches @binding(0) in WGSL
            visibility: GPUShaderStage.COMPUTE, // Accessible in compute shader
            buffer: {
                type: 'storage' // Matches var<storage,...> in WGSL
            }
        }]
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
    });

    // 5. Create Compute Pipeline
    // Links the shader entry point and layout
    const computePipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: {
            module: shaderModule,
            entryPoint: 'main' // Matches the function name in WGSL
        }
    });
    console.log("Compute pipeline created.");

    // 6. Create Bind Group
    // Connects the actual buffer (outputBuffer) to the shader's expected binding point (0)
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout, // Use the layout defined above
        entries: [{
            binding: 0, // Matches @binding(0)
            resource: {
                buffer: outputBuffer // The actual GPU buffer
            }
        }]
    });
    console.log("Bind group created.");

    // 7. Create Command Encoder and Dispatch Compute Job
    const commandEncoder = device.createCommandEncoder();
    outputElement.textContent = 'Dispatching compute shader...';
    console.log("Dispatching compute shader...");

    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup); // Use bind group at index 0

    // Calculate workgroups: WGSL workgroup size is 64. We want 256 total threads.
    // Workgroups needed = total threads / threads per workgroup
    const workgroupCount = Math.ceil(numElements / 64); // 256 / 64 = 4
    passEncoder.dispatchWorkgroups(workgroupCount, 1, 1); // Dispatch 4 workgroups in X dimension

    passEncoder.end(); // End the compute pass

    // 8. Copy Data from GPU Output Buffer to CPU-Readable Staging Buffer
    commandEncoder.copyBufferToBuffer(
        outputBuffer, 0, // Source buffer, offset
        stagingBuffer, 0, // Destination buffer, offset
        bufferSize // Size to copy
    );
    console.log("Encoded buffer copy command.");

    // 9. Submit Commands to GPU Queue
    const commandBuffer = commandEncoder.finish();
    device.queue.submit([commandBuffer]);
    console.log("Commands submitted to GPU queue.");
    outputElement.textContent = 'GPU work submitted. Waiting for results...';

    // 10. Read Data Back from Staging Buffer
    // Map the staging buffer to make it accessible from JavaScript
    await stagingBuffer.mapAsync(GPUMapMode.READ, 0, bufferSize); // Request read access
    console.log("Staging buffer mapped.");

    // Get a copy of the data
    const arrayBuffer = stagingBuffer.getMappedRange(0, bufferSize);
    // Create a typed array view (Uint32 because we stored u32 in the shader)
    // IMPORTANT: Create a copy of the data, because the underlying buffer is detached on unmap()
    const results = new Uint32Array(arrayBuffer.slice(0));

    // Unmap the buffer (releases the mapping lock)
    stagingBuffer.unmap();
    console.log("Staging buffer unmapped.");
    outputElement.textContent = 'GPU results received:';

    // 11. Display Results
    console.log("Results:", results);
    // Display first few and last few results for brevity
    let outputText = `Total Threads: ${numElements}\n`;
    outputText += `Workgroup Size (in WGSL): 64\n`;
    outputText += `Dispatched Workgroups: ${workgroupCount}\n\n`;
    outputText += `Results (first 10 and last 10):\n`;
    for (let i = 0; i < Math.min(10, numElements); i++) {
         outputText += `[${i}]: ${results[i]}\n`;
    }
    if (numElements > 20) {
        outputText += '...\n';
    }
     for (let i = Math.max(10, numElements - 10); i < numElements; i++) {
        outputText += `[${i}]: ${results[i]}\n`;
    }

    outputElement.textContent = outputText;

}

// Run the main async function and catch any errors
main().catch(err => {
    console.error("Error in main function:", err);
    const outputElement = document.getElementById('output');
    if (outputElement) {
        outputElement.textContent = `Error: ${err.message}\nCheck console for details.`;
    }
});