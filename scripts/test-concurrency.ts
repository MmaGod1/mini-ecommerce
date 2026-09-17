import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VARIANT_ID = "1f3bd378-46c7-4656-b957-b8a641826c59";

const NUMBER_OF_REQUESTS = 5;

async function placeTestOrder(index: number) {
  const orderId = `TEST-${Date.now()}-${index}`;

  const { data, error } = await supabase.rpc("place_order", {
    p_order_id: orderId,
    p_location: "Concurrency Test",
    p_phone: `08000000${index}`,
    p_comments: "Automated concurrency test",
    p_items: [
      {
        variantId: VARIANT_ID,
        quantity: 1,
      },
    ],
  });

  if (error) {
    return {
      index,
      success: false,
      orderId,
      error: error.message,
    };
  }

  return {
    index,
    success: true,
    orderId: data,
    error: null,
  };
}

async function main() {
  console.log("Starting concurrency test...");
  console.log(`Variant: ${VARIANT_ID}`);
  console.log(`Requests: ${NUMBER_OF_REQUESTS}`);
  console.log("");

  const results = await Promise.all(
    Array.from({ length: NUMBER_OF_REQUESTS }, (_, i) =>
      placeTestOrder(i + 1)
    )
  );

  console.table(results);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("");
  console.log(`Successful orders: ${successful.length}`);
  console.log(`Failed orders: ${failed.length}`);

  if (successful.length === 1) {
    console.log(
      "PASS: Exactly one request succeeded. Stock locking is working."
    );
  } else {
    console.log(
      "FAIL: Expected exactly one successful request."
    );
  }
}

main().catch((error) => {
  console.error("Test crashed:", error);
  process.exit(1);
});
