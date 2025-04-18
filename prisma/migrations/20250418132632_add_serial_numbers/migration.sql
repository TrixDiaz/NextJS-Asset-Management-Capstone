-- AlterTable
ALTER TABLE "DeploymentRecord" ADD COLUMN     "serialNumber" TEXT;

-- AlterTable
ALTER TABLE "StorageItem" ADD COLUMN     "serialNumbers" TEXT[];
