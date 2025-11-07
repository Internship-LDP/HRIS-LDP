import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";
import { PageProps } from "@/types/global"; // path sesuai alias kamu

export default function FlashMessage() {
  const { flash } = usePage<PageProps>().props;

  useEffect(() => {
    if (flash.success) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: flash.success,
        confirmButtonColor: "#3085d6",
      });
    }

    if (flash.error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: flash.error,
        confirmButtonColor: "#d33",
      });
    }
  }, [flash]);

  return null;
}
