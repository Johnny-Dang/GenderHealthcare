﻿using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class BookingDetailConfig : IEntityTypeConfiguration<BookingDetail>
    {
        public void Configure(EntityTypeBuilder<BookingDetail> builder)
        {
            builder.HasKey(bd => bd.BookingDetailId);
            builder.Property(x => x.SlotId)
                .IsRequired();

            builder.Property(bd => bd.FirstName).IsRequired();
            builder.Property(bd => bd.LastName).IsRequired();
            builder.Property(bd => bd.DateOfBirth).IsRequired();
            builder.Property(a => a.Phone).HasMaxLength(20).IsRequired();
            builder.Property(bd => bd.Gender).IsRequired();

            builder.HasOne(bd => bd.Booking)
                .WithMany(b => b.BookingDetails)
                .HasForeignKey(bd => bd.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bd => bd.TestResult)
                .WithOne(tr => tr.BookingDetail)
                .HasForeignKey<TestResult>(tr => tr.BookingDetailId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bd => bd.TestService)
                .WithMany(ts => ts.BookingDetails)
                .HasForeignKey(bd => bd.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ với TestServiceSlot
            builder.HasOne(x => x.TestServiceSlot)
               .WithMany(x => x.BookingDetails)
               .HasForeignKey(x => x.SlotId)
               .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 